import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
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
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastType[]>([]);

  const addToast = useCallback((message: string, type: ToastTypeT = "info") => {
    const id = Date.now();
    setToast((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
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
        <Toast
          message={ob.message}
          type={ob.type}
          onClose={() => removeToast(ob.id)}
        ></Toast>
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
