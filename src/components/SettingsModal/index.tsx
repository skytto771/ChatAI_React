import React, { useState, useEffect } from 'react';
import { type Theme, AVAILABLE_MODELS, MODEL_DISPLAY_NAMES } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import styles from './index.module.scss';

type SettingsPanel = 'user' | 'system' | 'roles' | 'about';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();
    const { settings, updateNickname, updateSoundEnabled, updateAutoScroll, updateDefaultModel, updateDefaultSystemPrompt, updateDefaultUserPrompt } = useUser();

    const [activePanel, setActivePanel] = useState<SettingsPanel>('user');
    const [tempNickname, setTempNickname] = useState(settings.nickname);
    const [tempSound, setTempSound] = useState(settings.soundEnabled);
    const [tempAutoScroll, setTempAutoScroll] = useState(settings.autoScroll);
    const [tempDefaultModel, setTempDefaultModel] = useState(settings.defaultModel);
    const [tempDefaultSystemPrompt, setTempDefaultSystemPrompt] = useState(settings.defaultSystemPrompt);
    const [tempDefaultUserPrompt, setTempDefaultUserPrompt] = useState(settings.defaultUserPrompt);

    // 同步外部变化
    useEffect(() => {
        setTempNickname(settings.nickname);
        setTempSound(settings.soundEnabled);
        setTempAutoScroll(settings.autoScroll);
        setTempDefaultModel(settings.defaultModel);
        setTempDefaultSystemPrompt(settings.defaultSystemPrompt);
        setTempDefaultUserPrompt(settings.defaultUserPrompt);
    }, [settings, isOpen]);

    const handleSaveNickname = () => {
        updateNickname(tempNickname);
    };

    const handleSaveRoles = () => {
        updateDefaultModel(tempDefaultModel);
        updateDefaultSystemPrompt(tempDefaultSystemPrompt);
        updateDefaultUserPrompt(tempDefaultUserPrompt);
    };

    const themes: { value: Theme; label: string; gradient: string }[] = [
        { value: 'default', label: '深邃紫夜', gradient: 'linear-gradient(90deg,#6c5ce7,#a855f7)' },
        { value: 'aurora', label: '极光翡翠', gradient: 'linear-gradient(90deg,#10b981,#34d399)' },
        { value: 'sunset', label: '日落暖橙', gradient: 'linear-gradient(90deg,#ea580c,#f97316)' },
        { value: 'frost', label: '冰霜蓝', gradient: 'linear-gradient(90deg,#2563eb,#3b82f6)' },
    ];

    const renderPanel = () => {
        switch (activePanel) {
            case 'user':
                return (
                    <div>
                        <div className={styles.settingsSectionLabel}>👤 个人信息</div>
                        <label className={styles.settingsLabel}>昵称</label>
                        <input
                            type="text"
                            value={tempNickname}
                            onChange={(e) => setTempNickname(e.target.value)}
                            className={styles.settingsInput}
                        />
                        <button className={styles.btnSecondary} onClick={handleSaveNickname}>保存昵称</button>
                    </div>
                );
            case 'system':
                return (
                    <div>
                        <div className={styles.settingsSectionLabel}>🎨 主题选择</div>
                        <div className={styles.themeOptions}>
                            {themes.map(t => (
                                <div
                                    key={t.value}
                                    className={`${styles.themeOption} ${theme === t.value ? styles.active : ''}`}
                                    onClick={() => setTheme(t.value)}
                                >
                                    <div className={styles.themePreview} style={{ background: t.gradient }}></div>
                                    {t.label}
                                </div>
                            ))}
                        </div>
                        <div className={styles.settingsSectionLabel} style={{ marginTop: '18px' }}>🔔 偏好设置</div>
                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>消息提示音</span>
                            <label className={styles.toggleSwitch}>
                                <input type="checkbox" checked={tempSound} onChange={(e) => setTempSound(e.target.checked)} />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>
                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>自动滚动到最新</span>
                            <label className={styles.toggleSwitch}>
                                <input type="checkbox" checked={tempAutoScroll} onChange={(e) => setTempAutoScroll(e.target.checked)} />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>
                        <button className={styles.btnSecondary} onClick={() => {
                            updateSoundEnabled(tempSound);
                            updateAutoScroll(tempAutoScroll);
                        }}>保存偏好</button>
                    </div>
                );
            case 'roles':
                return (
                    <div>
                        <div className={styles.settingsSectionLabel}>🤖 AI 默认系统提示词</div>
                        <textarea
                            value={tempDefaultSystemPrompt}
                            onChange={(e) => setTempDefaultSystemPrompt(e.target.value)}
                            rows={3}
                            placeholder="例如：你是一个专业的助手..."
                            className={styles.settingsTextarea}
                        />
                        <div className={styles.settingsSectionLabel} style={{ marginTop: '16px' }}>🧑 用户默认角色描述</div>
                        <textarea
                            value={tempDefaultUserPrompt}
                            onChange={(e) => setTempDefaultUserPrompt(e.target.value)}
                            rows={2}
                            placeholder="例如：我是一名产品经理..."
                            className={styles.settingsTextarea}
                        />
                        <div className={styles.settingsSectionLabel} style={{ marginTop: '16px' }}>⚙️ 默认模型</div>
                        <select
                            value={tempDefaultModel}
                            onChange={(e) => setTempDefaultModel(e.target.value)}
                            className={styles.settingsSelect}
                        >
                            {AVAILABLE_MODELS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        <button className={styles.btnSecondary} onClick={handleSaveRoles}>保存角色默认值</button>
                    </div>
                );
            case 'about':
                return (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        AI Chat v2.2<br />智能对话平台<br />支持多模型与角色提示词
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
                    <button className={styles.modalCloseBtn} onClick={onClose}>✕</button>
                </div>
                <div className={styles.settingsLayout}>
                    <div className={styles.settingsNav}>
                        <div
                            className={`${styles.settingsNavItem} ${activePanel === 'user' ? styles.active : ''}`}
                            onClick={() => setActivePanel('user')}
                        >👤 用户设置</div>
                        <div
                            className={`${styles.settingsNavItem} ${activePanel === 'system' ? styles.active : ''}`}
                            onClick={() => setActivePanel('system')}
                        >🖥️ 系统偏好</div>
                        <div
                            className={`${styles.settingsNavItem} ${activePanel === 'roles' ? styles.active : ''}`}
                            onClick={() => setActivePanel('roles')}
                        >🎭 角色提示词</div>
                        <div
                            className={`${styles.settingsNavItem} ${activePanel === 'about' ? styles.active : ''}`}
                            onClick={() => setActivePanel('about')}
                        >ℹ️ 关于</div>
                    </div>
                    <div className={styles.settingsContent}>
                        {renderPanel()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;