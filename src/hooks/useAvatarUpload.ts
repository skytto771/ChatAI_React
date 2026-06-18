import { useState, useRef, useCallback } from "react";
import {
  uploadFile,
  setAvatarFromUpload,
  UploadError,
} from "@/utils/uploadUtil";
import { useUserStore } from "@/store";
import { useToast } from "@/context/ToastContext";

interface UseAvatarUploadReturn {
  /** 是否正在上传 */
  uploading: boolean;
  /** 隐藏的 file input ref，需要绑定到 <input type="file"> */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** 触发文件选择 */
  triggerFileSelect: () => void;
  /** 处理文件选择变更（绑定到 input onChange） */
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * 头像上传 Hook
 * 封装了选择文件 → 校验 → 上传 → 设置头像 → 更新本地状态的完整流程
 */
export function useAvatarUpload(): UseAvatarUploadReturn {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userStore = useUserStore();
  const toast = useToast();

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        // 上传文件
        const result = await uploadFile(file, {
          maxSize: 5 * 1024 * 1024,
          accept: ["image/"],
        });

        // 设置为头像（后端持久化，返回确认的 fileUrl）
        const avatarUrl = await setAvatarFromUpload(result.id);

        // 更新本地状态
        userStore.setUser({
          ...userStore.user,
          avatarUrl: avatarUrl || result.fileUrl,
        });

        toast.success("头像更新成功");
      } catch (err) {
        const message =
          err instanceof UploadError ? err.message : "头像上传失败，请稍后重试";
        toast.error(message);
      } finally {
        setUploading(false);
        // 清空 input 以支持重复选择同一文件
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [userStore, toast],
  );

  return { uploading, fileInputRef, triggerFileSelect, handleFileChange };
}
