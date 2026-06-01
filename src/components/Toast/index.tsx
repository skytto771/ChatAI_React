import { useEffect, useState } from 'react';
import styles from './index.module.scss';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | '';
    duration?: number;
    onClose: () => void;
}

const Toast = ({ message, type = '', duration = 2800, onClose }: ToastProps) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 500); // 等待动画结束
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    return (
        <div className={`${styles.toast} ${visible ? styles.show : ''} ${type ? styles[type] : ''}`}>
            {message}
        </div>
    );
};

export default Toast;