import { useState } from 'react';
import styles from './index.module.scss';
import { isValidEmail } from '@/utils/validators';
import { http } from '@/utils/httpUtil'
import api from '@/api'

interface RegisterFormProps {
    onSuccess: (email: string) => void;
    onError: (message: string) => void;
}

const RegisterForm = ({ onSuccess, onError }: RegisterFormProps) => {
    // 表单数据
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    // 其他
    const [agreed, setAgreed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [codeSending, setCodeSending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleSubmit = async () => {
        const formOb = ['用户名','邮箱','密码', '验证码']
        const formVal = [username,email,password,verifyCode]
        const submitData = {username,email,password,verifyCode}

        for(let index in formVal){
            if (!formVal[index]) {
                onError(`请填写${formOb[index]}`);
                return;
            }
        }
        if (username.length < 2) {
            onError('用户名至少2个字符');
            return;
        }
        if (!isValidEmail(email)) {
            onError('请输入有效的邮箱地址');
            return;
        }
        if (password.length < 8) {
            onError('密码至少8位字符');
            return;
        }
        if (!agreed) {
            onError('请先同意服务条款');
            return;
        }

        
        setLoading(true);
        try{
            await http.post(api.user.register,submitData)
            onSuccess(email);
            setLoading(false);
        }catch(err){
            onError(err as string)
            setLoading(false);
        }
    };

    // 发送验证码逻辑
    const handleSendCode = async () => {
        if (!email) {
            onError('请先填写邮箱地址');
            return;
        }
    
        // 简单邮箱格式校验
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            onError('请输入有效的邮箱地址');
            return;
        }
        
        try {
            const submitData = {contact:email, purpose:'register', type:'email'}
            // 模拟发送请求（替换为您的实际API调用）
            await http.post(api.verification.sendCode, submitData)
            
            setCodeSending(true);
            // 启动60秒倒计时
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
        } catch (err) {
            onError(err as string);
        } finally {
            setCodeSending(false);
        }
    };

    // 处理验证码输入（只允许数字和字母）
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
        setVerifyCode(value);
    };

    return (
        <div className={styles.formPanel}>
            <div className={styles.inputGroup}>
                <label>用户名</label>
                <div className={styles.inputWrapper}>
                    <svg className={styles.iconPrefix} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                    </svg>
                    <input
                        type="text"
                        placeholder="输入用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                    />
                </div>
            </div>
            <div className={styles.inputGroup}>
                <label>邮箱地址</label>
                <div className={styles.inputWrapper}>
                    <svg className={styles.iconPrefix} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="4" width="20" height="16" rx="3" />
                        <path d="M2 6l10 7 10-7" />
                    </svg>
                    <input
                        type="email"
                        placeholder="输入邮箱"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
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
                        placeholder="至少8位字符"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                    <button
                        className={styles.togglePassword}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {/* 省略眼睛图标，可复用 LoginForm 中的逻辑 */}
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
            <div className={styles.inputGroup}>
                <label>验证码</label>
                <div className={styles.verifiCode}>
                    <input
                        type="text"
                        className={styles.codeInput}
                        placeholder="请输入验证码"
                        value={verifyCode}
                        onChange={handleCodeChange}
                        maxLength={6}
                        autoComplete="off"
                    />
                    <button
                        className={styles.sendCodeBtn}
                        type="button"
                        onClick={handleSendCode}
                        disabled={countdown > 0 || codeSending}
                    >
                        {codeSending ? (
                            '发送中...'
                        ) : countdown > 0 ? (
                            `${countdown}s后重发`
                        ) : (
                            '获取验证码'
                        )}
                    </button>
                </div>
            </div>
            <div className={styles.optionsRow}>
                <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <span>同意 <span className={styles.linkText}>服务条款</span></span>
                </label>
            </div>
            <button
                className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
                onClick={handleSubmit}
                disabled={loading}
            >
                <span className={styles.btnSpinner} />
                <span className={styles.btnText}>创建账号</span>
            </button>
        </div>
    );
};

export default RegisterForm;