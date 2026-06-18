import { createContext, memo, useCallback, useContext, useState } from "react";
import Toast from "@/components/Toast";

type ToastTypeT = "success" | "error" | "info" | "warning";

interface ToastType {
  id: string;
  message: string;
  type: ToastTypeT;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/** 隔离每个 Toast 实例，避免父组件重渲染导致 onClose 引用变化 */
const ToastItem = memo<{
  toast: ToastType;
  onRemove: (id: string) => void;
}>(({ toast, onRemove }) => {
  const handleClose = useCallback(() => {
    onRemove(toast.id);
  }, [onRemove, toast.id]);

  return (
    <Toast message={toast.message} type={toast.type} onClose={handleClose} />
  );
});
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastType[]>([]);

  const addToast = useCallback((message: string, type: ToastTypeT = "info") => {
    const id = Date.now().toString();
    setToast((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToast((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string) => addToast(message, "success"),
    [addToast],
  );
  const error = useCallback(
    (message: string) => addToast(message, "error"),
    [addToast],
  );
  const info = useCallback(
    (message: string) => addToast(message, "info"),
    [addToast],
  );
  const warning = useCallback(
    (message: string) => addToast(message, "warning"),
    [addToast],
  );

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      {toast.map((ob) => (
        <ToastItem key={ob.id} toast={ob} onRemove={removeToast} />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("缺失组件");
  }
  return context;
};
