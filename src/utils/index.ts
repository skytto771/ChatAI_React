import { http } from "./httpUtil";
import { session } from "./sessionUtil";
import { marked } from "./marked";

export { http, session, marked };

export {
  uploadFile,
  validateFile,
  setAvatarFromUpload,
  UploadError,
} from "./uploadUtil";
export type { UploadOptions, UploadResult } from "./uploadUtil";

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
