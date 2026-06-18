import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose: () => void;
}

const Toast = ({
  message,
  type = "info",
  duration = 2800,
  onClose,
}: ToastProps) => {
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    setVisible(true);
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, duration);
    const removeTimer = setTimeout(() => {
      handleClose();
    }, duration + 500);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [message, duration, handleClose]);

  return (
    <div
      className={`${styles.toast} ${visible ? styles.show : ""} ${type ? styles[type] : ""}`}
    >
      {message}
    </div>
  );
};

export default Toast;
