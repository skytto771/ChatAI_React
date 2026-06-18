import { useState } from "react";
import styles from "./index.module.scss";
import LoginForm from "./components/Form/LoginForm.tsx";
import RegisterForm from "./components/Form/RegisterForm";
// import SocialButtons from './components/SocialButtons';
import { useNavigate, useLocation } from "react-router";
import { useToast } from "@/context/ToastContext";

const LoginCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const handleLoginSuccess = (_email: string) => {
    toast.success("登录成功！欢迎回来");
    // 登录后跳回之前要访问的页面
    const from = (location.state as { from?: string })?.from || "/";
    navigate(from, { replace: true });
  };

  const handleRegisterSuccess = () => {
    toast.success("注册成功！正在跳转");
    setTimeout(() => {
      setActiveTab("login");
    }, 1500);
  };

  // const handleSocialLogin = (provider: string) => {
  //     showToast(`🔐 正在跳转至 ${provider} 登录...（演示）`, 'success');
  // };

  return (
    <>
      <div className={styles.loginCard}>
        <div className={styles.logoArea}>
          <div className={styles.aiIcon}>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                fill="white"
                opacity="0.95"
              />
              <circle cx="12" cy="19" r="1.8" fill="white" opacity="0.7" />
            </svg>
          </div>
          <span className={styles.brandText}>星语</span>
        </div>
        <p className={styles.subtitle}>智能对话 · 无限可能</p>

        <div
          className={`${styles.tabSwitch} ${activeTab === "register" ? styles.registerActive : ""}`}
        >
          <div className={styles.tabBg} />
          <button
            className={`${styles.tabBtn} ${activeTab === "login" ? styles.active : ""}`}
            onClick={() => setActiveTab("login")}
          >
            登 录
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "register" ? styles.active : ""}`}
            onClick={() => setActiveTab("register")}
          >
            注 册
          </button>
        </div>

        {activeTab === "login" ? (
          <LoginForm onSuccess={handleLoginSuccess} onError={toast.error} />
        ) : (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onError={toast.error}
          />
        )}

        {/* <SocialButtons onClick={handleSocialLogin} /> */}
      </div>
    </>
  );
};

export default LoginCard;
