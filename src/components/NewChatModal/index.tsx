import React, { useState } from 'react';
import { AVAILABLE_MODELS } from '@/types';
import { useUser } from '@/context/UserContext';
import { useChatStore } from '@/store';
import styles from './index.module.scss';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
    const { settings } = useUser();
    const createNewChat = useChatStore(state => state.createNewChat);

    const [title, setTitle] = useState('');
    const [model, setModel] = useState(settings.defaultModel);
    const [systemPrompt, setSystemPrompt] = useState(settings.defaultSystemPrompt);
    const [userPrompt, setUserPrompt] = useState(settings.defaultUserPrompt);

    const handleCreate = () => {
        createNewChat(title, model, systemPrompt, userPrompt);
        onClose();
        // 重置表单
        setTitle('');
        setModel(settings.defaultModel);
        setSystemPrompt(settings.defaultSystemPrompt);
        setUserPrompt(settings.defaultUserPrompt);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>✨ 新建对话</h3>
                    <button className={styles.modalCloseBtn} onClick={onClose}>✕</button>
                </div>
                <div className={styles.formGroup}>
                    <label>对话标题 (可选)</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="给对话起个名字"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>选择模型</label>
                    <select value={model} onChange={(e) => setModel(e.target.value)}>
                        {AVAILABLE_MODELS.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>AI 系统提示词</label>
                    <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={3}
                        placeholder="例如：你是一个专业、友善的AI助手..."
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>用户角色描述 (可选)</label>
                    <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        rows={2}
                        placeholder="例如：我是一名软件工程师..."
                    />
                </div>
                <button className={styles.createBtn} onClick={handleCreate}>创建对话</button>
            </div>
        </div>
    );
};

export default NewChatModal;