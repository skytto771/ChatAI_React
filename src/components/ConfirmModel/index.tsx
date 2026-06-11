// ConfirmDialog.tsx
import React from 'react';
import styles from './index.module.scss';

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean; // 是否为危险操作，改变确认按钮颜色
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  title = '提示',
  confirmText = '确定',
  cancelText = '取消',
  danger = false,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    // 点击遮罩层默认取消
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmHeader}>
          <h3>{title}</h3>
        </div>
        <div className={styles.confirmBody}>
          <p>{message}</p>
        </div>
        <div className={styles.confirmFooter}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`${styles.confirmBtn} ${danger ? styles.danger : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;