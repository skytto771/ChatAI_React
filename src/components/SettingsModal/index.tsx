import React, { useEffect, useState } from "react";
import { type Theme } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import styles from "./index.module.scss";
import { useUserStore, useChatStore } from "@/store";
import { useToast } from "@/context/ToastContext";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

type SettingsPanel = "user" | "system" | "roles" | "model" | "about";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { updateUserModelSettings, settings } = useChatStore();
  const { theme, setTheme } = useTheme();
  const userStore = useUserStore();
  const toast = useToast();

  const [activePanel, setActivePanel] = useState<SettingsPanel>("user");
  // const [isUserEdit, setIsUserEdit] = useState(false);
  const {
    uploading: avatarUploading,
    fileInputRef,
    triggerFileSelect,
    handleFileChange,
  } = useAvatarUpload();
  // 提示词配置
  // const [tempDefaultModel, setTempDefaultModel] = useState('gtp-3.5-turbo');
  // const [tempDefaultSystemPrompt, setTempDefaultSystemPrompt] = useState('');
  // const [tempDefaultUserPrompt, setTempDefaultUserPrompt] = useState('');

  // 模型设置状态
  const [contextLimit, setContextLimit] = useState(settings.contextLimit);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [thinkingMode, setThinkingMode] = useState(settings.thinkingMode);
  const [enableWebSearch, setEnableWebSearch] = useState(
    settings.enableWebSearch,
  );
  // const [enableCodeInterpreter, setEnableCodeInterpreter] = useState(false);
  const [enableFileUpload, setEnableFileUpload] = useState(
    settings.enableFileUpload,
  );

  // const handleSaveUser = () => {
  //   setIsUserEdit(false);
  //   toast.success("保存成功");
  // };

  // const handleSaveRoles = () => {
  //     toast.success('角色默认值已保存')
  // };

  const handleSaveModel = async () => {
    // 这里可以调用 API 保存模型设置
    try {
      await updateUserModelSettings({
        thinkingMode,
        contextLimit,
        enableWebSearch,
        enableFileUpload,
        maxTokens,
      });
      toast.success("设置已保存");
    } catch (error: any) {
      toast.error(error?.message || String(error));
    }
  };

  // const savePerfrence = () => {
  //   toast.success("偏好设置已保存");
  // };

  const themes: { value: Theme; label: string; gradient: string }[] = [
    {
      value: "default",
      label: "深邃紫夜",
      gradient: "linear-gradient(90deg,#6c5ce7,#a855f7)",
    },
    {
      value: "aurora",
      label: "极光翡翠",
      gradient: "linear-gradient(90deg,#10b981,#34d399)",
    },
    {
      value: "sunset",
      label: "日落暖橙",
      gradient: "linear-gradient(90deg,#ea580c,#f97316)",
    },
    {
      value: "frost",
      label: "冰霜蓝",
      gradient: "linear-gradient(90deg,#2563eb,#3b82f6)",
    },
  ];

  // 上下文窗口大小选项
  const contextLimits = {
    1024: "1K",
    2048: "2K",
    4096: "4K",
    8192: "8K",
    16384: "16K",
    32768: "32K",
    65536: "64K",
    131072: "128K",
    262144: "256K",
    524288: "512K",
    1048576: "1M",
  };

  // // token 选项
  const tokenOptions = {
    1024: "1K",
    2048: "2K",
    4096: "4K",
    8192: "8K",
    16384: "16K",
    32768: "32K",
    65536: "64K",
    131072: "128K",
    262144: "256K",
    524288: "512K",
    1048576: "1M",
  };

  useEffect(() => {
    if (settings.contextLimit != undefined)
      setContextLimit(settings.contextLimit);
    if (settings.thinkingMode != undefined)
      setThinkingMode(settings.thinkingMode);
    if (settings.enableWebSearch != undefined)
      setEnableWebSearch(settings.enableWebSearch);
    if (settings.enableFileUpload != undefined)
      setEnableFileUpload(settings.enableFileUpload);
  }, [activePanel, settings]);

  const renderPanel = () => {
    switch (activePanel) {
      case "user":
        return (
          <div>
            <div className={styles.settingsSectionLabel}>👤 个人信息</div>
            <label className={styles.settingsLabel}>头像</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div
              className={`${styles.userAvatar} ${avatarUploading ? styles.avatarUploading : ""} ${userStore.user.avatarUrl ? "" : styles.avatarPlaceholder}`}
              onClick={() => !avatarUploading && triggerFileSelect()}
              title="点击更换头像"
            >
              {userStore.user.avatarUrl ? (
                <img src={userStore.user.avatarUrl} alt="头像" />
              ) : (
                <span>🧑‍🚀</span>
              )}
              {avatarUploading && (
                <div className={styles.avatarOverlay}>
                  <span className={styles.avatarSpinner} />
                </div>
              )}
            </div>
            <label className={styles.settingsLabel}>用户名</label>
            <input
              type="text"
              value={userStore.user.username}
              className={styles.settingsInput}
              disabled={true}
            />
            <label className={styles.settingsLabel}>邮箱</label>
            <input
              type="email"
              value={userStore.user.email}
              className={styles.settingsInput}
              disabled={true}
            />
            {/* {isUserEdit ? (
              <button className={styles.btnSecondary} onClick={handleSaveUser}>
                保存用户设置
              </button>
            ) : (
              <button
                className={styles.btnSecondary}
                onClick={() => setIsUserEdit(true)}
              >
                修改用户设置
              </button>
            )} */}
          </div>
        );
      case "system":
        return (
          <div>
            <div className={styles.settingsSectionLabel}>🎨 主题选择</div>
            <div className={styles.themeOptions}>
              {themes.map((t) => (
                <div
                  key={t.value}
                  className={`${styles.themeOption} ${theme === t.value ? styles.active : ""}`}
                  onClick={() => setTheme(t.value)}
                >
                  <div
                    className={styles.themePreview}
                    style={{ background: t.gradient }}
                  ></div>
                  {t.label}
                </div>
              ))}
            </div>
            {/* <div
              className={styles.settingsSectionLabel}
              style={{ marginTop: "18px" }}
            >
              🔔 偏好设置
            </div>
            <button className={styles.btnSecondary} onClick={savePerfrence}>
              保存偏好
            </button> */}
          </div>
        );
      // case 'roles':
      //     return (
      //         <div>
      //             <div className={styles.settingsSectionLabel}>🤖 AI 默认系统提示词</div>
      //             <textarea
      //                 value={tempDefaultSystemPrompt}
      //                 onChange={(e) => setTempDefaultSystemPrompt(e.target.value)}
      //                 rows={3}
      //                 placeholder="例如：你是一个专业的助手..."
      //                 className={styles.settingsTextarea}
      //             />
      //             <div className={styles.settingsSectionLabel} style={{ marginTop: '16px' }}>🧑 用户默认角色描述</div>
      //             <textarea
      //                 value={tempDefaultUserPrompt}
      //                 onChange={(e) => setTempDefaultUserPrompt(e.target.value)}
      //                 rows={2}
      //                 placeholder="例如：我是一名产品经理..."
      //                 className={styles.settingsTextarea}
      //             />
      //             <div className={styles.settingsSectionLabel} style={{ marginTop: '16px' }}>⚙️ 默认模型</div>
      //             <select
      //                 value={tempDefaultModel}
      //                 onChange={(e) => setTempDefaultModel(e.target.value)}
      //                 className={styles.settingsSelect}
      //             >
      //                 {AVAILABLE_MODELS.map(m => (
      //                     <option key={m.value} value={m.value}>{m.label}</option>
      //                 ))}
      //             </select>
      //             <button className={styles.btnSecondary} onClick={handleSaveRoles}>保存角色默认值</button>
      //         </div>
      //     );
      case "model":
        return (
          <div>
            {/* 上下文配置 */}
            <div className={styles.settingsSectionLabel}>📊 上下文配置</div>

            <label className={styles.settingsLabel}>
              记忆限制（上下文消息）
            </label>
            <select
              value={contextLimit}
              onChange={(e) => setContextLimit(Number(e.target.value))}
              className={styles.settingsSelect}
            >
              {Object.keys(contextLimits).map((limit, index) => {
                return (
                  <option key={limit} value={limit}>
                    {Object.values(contextLimits)[index]}
                  </option>
                );
              })}
            </select>

            <label className={styles.settingsLabel}>单次回复最大 Token</label>
            <select
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className={styles.settingsSelect}
            >
              {Object.keys(tokenOptions).map((token, index) => (
                <option key={token} value={token}>
                  {Object.values(tokenOptions)[index]}
                </option>
              ))}
            </select>

            {/* 思考模式配置 */}
            <div
              className={styles.settingsSectionLabel}
              style={{ marginTop: "18px" }}
            >
              🧠 思考模式配置
            </div>

            <label className={styles.settingsLabel}>思考模式</label>
            <div className={styles.radioGroup}>
              {[
                {
                  value: "fast",
                  label: "快速",
                  desc: "响应迅速，适合简单对话",
                },
                { value: "balanced", label: "均衡", desc: "平衡速度与深度" },
                {
                  value: "deep",
                  label: "深度",
                  desc: "深度思考，适合复杂问题",
                },
              ].map((mode) => (
                <label
                  key={mode.value}
                  className={`${styles.radioCard} ${thinkingMode === mode.value ? styles.active : ""}`}
                >
                  <input
                    type="radio"
                    name="thinkingMode"
                    value={mode.value}
                    checked={thinkingMode === mode.value}
                    onChange={(e) =>
                      setThinkingMode(
                        e.target.value as "fast" | "balanced" | "deep",
                      )
                    }
                  />
                  <div className={styles.radioContent}>
                    <span className={styles.radioLabel}>{mode.label}</span>
                    <span className={styles.radioDesc}>{mode.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* 功能开关 */}
            <div
              className={styles.settingsSectionLabel}
              style={{ marginTop: "18px" }}
            >
              🔧 功能开关
            </div>

            <div className={styles.settingRow}>
              <div>
                <span className={styles.settingLabel}>🌐 联网搜索</span>
                <p className={styles.settingDesc}>
                  允许模型搜索互联网获取最新信息
                </p>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={enableWebSearch}
                  onChange={(e) => setEnableWebSearch(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            {/* <div className={styles.settingRow}>
                            <div>
                                <span className={styles.settingLabel}>💻 代码解释器</span>
                                <p className={styles.settingDesc}>启用代码执行与数据分析能力</p>
                            </div>
                            <label className={styles.toggleSwitch}>
                                <input
                                    type="checkbox"
                                    checked={enableCodeInterpreter}
                                    onChange={(e) => setEnableCodeInterpreter(e.target.checked)}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div> */}

            <div className={styles.settingRow}>
              <div>
                <span className={styles.settingLabel}>@ 文件上传</span>
                <p className={styles.settingDesc}>允许上传文件进行分析</p>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={enableFileUpload}
                  onChange={(e) => setEnableFileUpload(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            <button className={styles.btnSecondary} onClick={handleSaveModel}>
              💾 保存模型设置
            </button>
          </div>
        );
      case "about":
        return (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            星语 {import.meta.env.VITE_VERSION}
            <br />
            智能对话平台
            <br />
            支持多模型与角色提示词
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>⚙️ 系统设置</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.settingsLayout}>
          <div className={styles.settingsNav}>
            <div
              className={`${styles.settingsNavItem} ${activePanel === "user" ? styles.active : ""}`}
              onClick={() => setActivePanel("user")}
            >
              👤 用户设置
            </div>
            <div
              className={`${styles.settingsNavItem} ${activePanel === "system" ? styles.active : ""}`}
              onClick={() => setActivePanel("system")}
            >
              🖥️ 系统偏好
            </div>
            {/* <div
                            className={`${styles.settingsNavItem} ${activePanel === 'roles' ? styles.active : ''}`}
                            onClick={() => setActivePanel('roles')}
                        >🎭 角色提示词</div> */}
            <div
              className={`${styles.settingsNavItem} ${activePanel === "model" ? styles.active : ""}`}
              onClick={() => setActivePanel("model")}
            >
              🤖 模型设置
            </div>
            <div
              className={`${styles.settingsNavItem} ${activePanel === "about" ? styles.active : ""}`}
              onClick={() => setActivePanel("about")}
            >
              ℹ️ 关于
            </div>
          </div>
          <div className={styles.settingsContent}>{renderPanel()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
