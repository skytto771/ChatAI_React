// uploaderWorker.ts — Web Worker：计算文件 MD5 并切片
import SparkMD5 from "spark-md5";

const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB 分片

export interface WorkerTask {
  file: File;
  fileWorkerId: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash?: string;
  chunks?: WorkerChunk[];
  status?: string;
}

export interface WorkerChunk {
  index: number;
  data: Blob;
  retries: number;
}

self.onmessage = async (
  event: MessageEvent<{ type: string; payload: WorkerTask }>,
) => {
  const { type, payload } = event.data;
  switch (type) {
    case "CALCULATE_MD5":
      getFileMD5(payload);
      break;
  }
};

function getFileMD5(task: WorkerTask, chunkSize = CHUNK_SIZE): void {
  const { file, fileWorkerId } = task;

  const blobSlice =
    File.prototype.slice ||
    (File.prototype as any).mozSlice ||
    (File.prototype as any).webkitSlice;

  const chunkCount = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  const chunks: WorkerChunk[] = [];
  const spark = new SparkMD5.ArrayBuffer();
  const fileReader = new FileReader();

  const loadNext = () => {
    const start = currentChunk * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = blobSlice.call(file, start, end) as Blob;
    chunks.push({ index: currentChunk, data: chunk, retries: 0 });
    fileReader.readAsArrayBuffer(chunk);
  };

  fileReader.onload = (e) => {
    spark.append(e.target!.result as ArrayBuffer);
    currentChunk++;

    if (currentChunk < chunkCount) {
      loadNext();
    } else {
      const md5 = spark.end();
      spark.destroy();
      task.fileHash = md5;
      task.chunks = chunks;

      self.postMessage({
        type: "MD5_COMPLETE",
        payload: task,
      });
    }
  };

  fileReader.onerror = () => {
    self.postMessage({
      type: "MD5_ERROR",
      payload: { fileWorkerId, error: "文件读取失败，无法计算 MD5" },
    });
  };

  loadNext();
}
