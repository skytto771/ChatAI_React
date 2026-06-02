import { useState, useCallback } from 'react';
import styles from './index.module.scss';
import LoginForm from './components/Form/LoginForm.tsx';
import RegisterForm from './components/Form/RegisterForm';
// import SocialButtons from './components/SocialButtons';
import Toast from '../Toast';

const LoginCard = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | '' } | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' | '' = '') => {
        setToast({ message, type });
    }, []);

    const clearToast = useCallback(() => {
        setToast(null);
    }, []);

    const handleLoginSuccess = (email: string) => {
        showToast('✅ 登录成功！欢迎回来 🎉', 'success');
        console.log('登录数据:', { email });
    };

    const handleRegisterSuccess = (email: string) => {
        showToast('🎉 注册成功！请前往登录', 'success');
        setTimeout(() => {
            // setActiveTab('login');
        }, 1500);
    };

    const handleSocialLogin = (provider: string) => {
        showToast(`🔐 正在跳转至 ${provider} 登录...（演示）`, 'success');
    };

    return (
        <>
            {toast && (
                <Toast
                message={toast.message}
                type={toast.type}
                onClose={clearToast}
                />
            )}
            <div className={styles.loginCard}>
                <div className={styles.logoArea}>
                    <div className={styles.aiIcon}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white" opacity="0.95"/>
                            <circle cx="12" cy="19" r="1.8" fill="white" opacity="0.7"/>
                        </svg>
                    </div>
                    <span className={styles.brandText}>AI Chat</span>
                </div>
                <p className={styles.subtitle}>智能对话 · 无限可能</p>

                <div className={`${styles.tabSwitch} ${activeTab === 'register' ? styles.registerActive : ''}`}>
                    <div className={styles.tabBg} />
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'login' ? styles.active : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        登 录
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'register' ? styles.active : ''}`}
                        onClick={() => setActiveTab('register')}
                    >
                        注 册
                    </button>
                </div>

                {activeTab === 'login' ? (
                    <LoginForm onSuccess={handleLoginSuccess} onError={showToast} onShake={() => {}} />
                ) : (
                    <RegisterForm onSuccess={handleRegisterSuccess} onError={showToast} />
                )}

                {/* <SocialButtons onClick={handleSocialLogin} /> */}
            </div>
        </>
    );
};

export default LoginCard;