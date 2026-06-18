import api from "@/api";
import { session } from "../sessionUtil";
import UploaderWorker from "@/workers/uploaderWorker.ts?worker";
import type { WorkerTask, WorkerChunk } from "@/workers/uploaderWorker";

// ============ 常量 ============
const CHUNK_SIZE = 3 * 1024 * 1024;
const SMALL_FILE_THRESHOLD = 4 * CHUNK_SIZE;
const CONCURRENT_CHUNKS = 3;
const MAX_RETRIES = 3;

const API_BASE =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEVELOPMENT_API_URL
    : import.meta.env.VITE_PRODUCTION_API_URL;

/** 上传专用 POST（fetch 直连，绕过 axios 拦截器对 code 字段的校验） */
async function uploadPost(url: string, body: FormData | object): Promise<any> {
  const isFormData = body instanceof FormData;
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: session.getToken() || "",
    },
    body: isFormData ? body : JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new UploadError(err.message || "请求失败", "UPLOAD_FAILED");
  }
  const json = await res.json();
  // 兼容 ResponseUtil 格式和原始格式
  if (json.code !== undefined) {
    if (json.code !== 0)
      throw new UploadError(json.message || "上传失败", "UPLOAD_FAILED");
    return json.data ?? json;
  }
  // 兼容 { success: true, data: ... } 格式
  if (json.success === false)
    throw new UploadError(json.message || "上传失败", "UPLOAD_FAILED");
  return json;
}

// ============ 类型 ============

export interface UploadOptions {
  maxSize?: number;
  accept?: string[];
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export interface UploadResult {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
}

export class UploadError extends Error {
  code:
    | "INVALID_TYPE"
    | "TOO_LARGE"
    | "UPLOAD_FAILED"
    | "NO_FILE"
    | "CANCELLED"
    | "HASH_FAILED";

  constructor(
    message: string,
    code:
      | "INVALID_TYPE"
      | "TOO_LARGE"
      | "UPLOAD_FAILED"
      | "NO_FILE"
      | "CANCELLED"
      | "HASH_FAILED",
  ) {
    super(message);
    this.name = "UploadError";
    this.code = code;
  }
}

// ============ Worker 管理 ============

let worker: Worker | null = null;
const pendingHashPromises = new Map<
  string,
  { resolve: (t: WorkerTask) => void; reject: (e: Error) => void }
>();

function getWorker(): Worker {
  if (!worker) {
    worker = new UploaderWorker();
    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "MD5_COMPLETE") {
        const entry = pendingHashPromises.get(payload.fileWorkerId);
        if (entry) {
          entry.resolve(payload);
          pendingHashPromises.delete(payload.fileWorkerId);
        }
      } else if (type === "MD5_ERROR") {
        const entry = pendingHashPromises.get(payload.fileWorkerId);
        if (entry) {
          entry.reject(new UploadError(payload.error, "HASH_FAILED"));
          pendingHashPromises.delete(payload.fileWorkerId);
        }
      }
    };
  }
  return worker;
}

function computeMD5InWorker(task: WorkerTask): Promise<WorkerTask> {
  return new Promise((resolve, reject) => {
    pendingHashPromises.set(task.fileWorkerId, { resolve, reject });
    getWorker().postMessage({ type: "CALCULATE_MD5", payload: task });
  });
}

// ============ 文件校验 ============

export function validateFile(
  file: File,
  options: UploadOptions = {},
): UploadError | null {
  const { maxSize = 5 * 1024 * 1024, accept = ["image/"] } = options;
  if (!file) return new UploadError("未选择文件", "NO_FILE");
  const isAccepted = accept.some((p) => file.type.startsWith(p));
  if (!isAccepted) return new UploadError("文件类型不支持", "INVALID_TYPE");
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024);
    return new UploadError(`文件大小不能超过 ${mb}MB`, "TOO_LARGE");
  }
  return null;
}

// ============ 小文件上传 ============

async function uploadSmall(
  file: File,
  fileHash: string,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileHash", fileHash);

  const res = await uploadPost(api.upload.uploadSmall, formData);

  const d = res.data || res;
  return {
    id: d.id,
    fileUrl: d.fileUrl || "",
    fileName: d.fileName || file.name,
    fileSize: d.fileSize || file.size,
    mimeType: d.mimeType || file.type,
    fileHash,
  };
}

// ============ 大文件分片上传 ============

async function uploadLarge(
  file: File,
  fileHash: string,
  chunks: WorkerChunk[],
  options: UploadOptions,
): Promise<UploadResult> {
  const { signal, onProgress } = options;

  // 1. 初始化
  const initRes = await uploadPost(api.upload.largeFileInit, {
    fileHash,
    fileSize: file.size,
    originalName: file.name,
    mimeType: file.type,
  });
  if (signal?.aborted) throw new UploadError("上传已取消", "CANCELLED");

  const fileId: string = initRes.data?.id || initRes.id;

  // 秒传
  if (initRes.uploaded) {
    onProgress?.(100);
    return {
      id: fileId,
      fileUrl: initRes.data?.fileUrl || "",
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileHash,
    };
  }

  // 2. 过滤已上传的分片
  const uploadedSet = new Set(
    (initRes.uploadedChunks || []).map((c: any) => c.chunkIndex),
  );
  const pendingChunks = chunks.filter((c) => !uploadedSet.has(c.index));
  const totalChunks = chunks.length;

  // 3. 并发上传
  let completedCount = totalChunks - pendingChunks.length;
  let activeCount = 0;
  let nextIndex = 0;

  const uploadOne = async (chunk: WorkerChunk, retry = 0): Promise<void> => {
    if (signal?.aborted) return;
    const formData = new FormData();
    formData.append("chunk", chunk.data);
    formData.append(
      "chunkData",
      JSON.stringify({ fileId, chunkIndex: chunk.index }),
    );

    try {
      await uploadPost(api.upload.chunk, formData);
      completedCount++;
      onProgress?.(Math.ceil((completedCount / totalChunks) * 100));
    } catch {
      if (retry < MAX_RETRIES && !signal?.aborted) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, retry)));
        return uploadOne(chunk, retry + 1);
      }
      throw new UploadError(`分片 ${chunk.index} 上传失败`, "UPLOAD_FAILED");
    }
  };

  await new Promise<void>((resolve, reject) => {
    const run = () => {
      while (
        activeCount < CONCURRENT_CHUNKS &&
        nextIndex < pendingChunks.length
      ) {
        if (signal?.aborted) {
          reject(new UploadError("上传已取消", "CANCELLED"));
          return;
        }
        activeCount++;
        uploadOne(pendingChunks[nextIndex++]).finally(() => {
          activeCount--;
          run();
        });
      }
      if (nextIndex >= pendingChunks.length && activeCount === 0) resolve();
    };
    run();
  });

  if (signal?.aborted) throw new UploadError("上传已取消", "CANCELLED");

  // 4. 合并
  const mergeRes = await uploadPost(api.upload.mergeComplete, {
    fileId,
    fileHash,
    chunkCount: totalChunks,
  });
  onProgress?.(100);

  return {
    id: fileId,
    fileUrl: mergeRes.data?.fileUrl || mergeRes.fileUrl || "",
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    fileHash,
  };
}

// ============ 公开 API ============

/**
 * 上传文件（自动选择小文件/大文件模式，Web Worker 计算 MD5）
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const error = validateFile(file, { maxSize: Infinity, ...options });
  if (error) throw error;

  // 计算 MD5（Worker 线程）
  const fileWorkerId = `f_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const computed = await computeMD5InWorker({
    file,
    fileWorkerId,
    originalName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });

  try {
    if (file.size < SMALL_FILE_THRESHOLD) {
      return await uploadSmall(file, computed.fileHash!);
    } else {
      return await uploadLarge(
        file,
        computed.fileHash!,
        computed.chunks || [],
        options,
      );
    }
  } catch (err) {
    if (err instanceof UploadError) throw err;
    throw new UploadError("上传失败", "UPLOAD_FAILED");
  } finally {
    pendingHashPromises.delete(fileWorkerId);
  }
}

/**
 * 将上传的文件设置为用户头像，返回后端持久化的 fileUrl
 */
export async function setAvatarFromUpload(fileId: string): Promise<string> {
  const res = await uploadPost(api.user.setAvatarUrl, { avatarId: fileId });
  return res.data?.fileUrl || res.fileUrl || "";
}
