import { useState } from 'react';
import styles from './index.module.scss';

interface LoginFormProps {
    onSuccess: (account: string) => void;
    onError: (message: string) => void;
    onShake: (element: HTMLElement) => void;
}

const LoginForm = ({ onSuccess, onError, onShake }: LoginFormProps) => {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!account || !password) {
            onError('⚠️ 请填写所有字段');
            return;
        }
        if (!account) {
            onError('⚠️ 请输入有效的邮箱地址');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSuccess(account);
            onError(''); // clear errors
        }, 1800);
    };

    return (
        <div className={styles.formPanel}>
            <div className={styles.inputGroup}>
                <label>账号</label>
                <div className={styles.inputWrapper}>
                    <svg className={styles.iconPrefix} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="4" width="20" height="16" rx="3" />
                        <path d="M2 6l10 7 10-7" />
                    </svg>
                    <input
                        type="account"
                        placeholder="用户名/邮箱"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        autoComplete="account"
                    />
                </div>
            </div>
            <div className={styles.inputGroup}>
                <label>密码</label>
                <div className={styles.inputWrapper}>
                    <svg className={styles.iconPrefix} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="11" width="18" height="11" rx="3" />
                        <circle cx="12" cy="16" r="1.5" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                    <button
                        className={styles.togglePassword}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="切换密码可见"
                    >
                        {showPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-10-8-10-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <div className={styles.optionsRow}>
                <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>记住我</span>
                </label>
                <span className={styles.linkText} onClick={() => onError('🔗 重置链接已发送至您的邮箱（演示）')}>
                    忘记密码？
                </span>
            </div>
            <button
                className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
                onClick={handleSubmit}
                disabled={loading}
            >
                <span className={styles.btnSpinner} />
                <span className={styles.btnText}>登 录</span>
            </button>
        </div>
    );
};

export default LoginForm;