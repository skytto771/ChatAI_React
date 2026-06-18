import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ParticlesBackground from "../../components/ParticlesBackground";
import styles from "./index.module.scss";
import api from "@/api";
import { http, isValidEmail } from "@/utils";
import { useToast } from "@/context/ToastContext";

type Step = "input-email" | "reset-password";

function ForgetPsd() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState<Step>("input-email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error("请输入邮箱地址");
      return;
    }
    if (!isValidEmail(email.trim())) {
      toast.error("邮箱格式不正确");
      return;
    }

    setLoading(true);
    try {
      await http.post(api.user.forgotPassword, { email: email.trim() });
      toast.success("验证码已发送到您的邮箱");
      setStep("reset-password");
      setCountdown(60);
    } catch {
      toast.error("发送验证码失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 重置密码
  const handleResetPassword = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      toast.error("请输入6位验证码");
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 20) {
      toast.error("密码长度必须在6-20个字符之间");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      await http.post(api.user.resetPassword, {
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      toast.success("密码重置成功，请使用新密码登录");
      navigate("/login");
    } catch {
      toast.error("重置失败，请检查验证码是否正确");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.app}>
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />
      <div className="grid-overlay" />
      <ParticlesBackground />

      <div className={styles.card}>
        {/* Logo */}
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
        <p className={styles.subtitle}>
          {step === "input-email" ? "找回密码" : "重置密码"}
        </p>

        {/* Step 1: 输入邮箱 */}
        {step === "input-email" && (
          <div className={styles.formPanel}>
            <p className={styles.hint}>
              请输入注册时使用的邮箱，我们将发送验证码
            </p>
            <div className={styles.inputGroup}>
              <label>邮箱</label>
              <div className={styles.inputWrapper}>
                <svg
                  className={styles.iconPrefix}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 6l10 7 10-7" />
                </svg>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  autoFocus
                />
              </div>
            </div>
            <button
              className={`${styles.submitBtn} ${loading ? styles.loading : ""}`}
              onClick={handleSendCode}
              disabled={loading}
            >
              <span className={styles.btnSpinner} />
              <span className={styles.btnText}>发送验证码</span>
            </button>
            <p className={styles.backLink} onClick={() => navigate("/login")}>
              ← 返回登录
            </p>
          </div>
        )}

        {/* Step 2: 输入验证码和新密码 */}
        {step === "reset-password" && (
          <div className={styles.formPanel}>
            <p className={styles.hint}>
              验证码已发送至 <strong>{email}</strong>
            </p>

            <div className={styles.inputGroup}>
              <label>验证码</label>
              <div className={styles.codeRow}>
                <input
                  className={styles.codeInput}
                  type="text"
                  maxLength={6}
                  placeholder="6位验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
                <button
                  className={styles.resendBtn}
                  disabled={countdown > 0 || loading}
                  onClick={handleSendCode}
                >
                  {countdown > 0 ? `${countdown}s` : "重新发送"}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>新密码</label>
              <div className={styles.inputWrapper}>
                <svg
                  className={styles.iconPrefix}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <circle cx="12" cy="16" r="1.5" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="6-20位新密码"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>确认密码</label>
              <div className={styles.inputWrapper}>
                <svg
                  className={styles.iconPrefix}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <circle cx="12" cy="16" r="1.5" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="请再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                />
              </div>
            </div>

            <button
              className={`${styles.submitBtn} ${loading ? styles.loading : ""}`}
              onClick={handleResetPassword}
              disabled={loading}
            >
              <span className={styles.btnSpinner} />
              <span className={styles.btnText}>重置密码</span>
            </button>

            <p
              className={styles.backLink}
              onClick={() => {
                setStep("input-email");
                setCode("");
              }}
            >
              ← 更换邮箱
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgetPsd;
