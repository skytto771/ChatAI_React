import React from 'react';
import { type Chat, MODEL_DISPLAY_NAMES } from '@/types';
import UserProfile from '@/components/UserProfile';
import styles from './index.module.scss';

interface ChatSidebarProps {
    chats: Chat[];
    activeChatId: string;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onOpenSettings: () => void;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    chats,
    activeChatId,
    onNewChat,
    onSelectChat,
    onOpenSettings,
    onLogout,
    isOpen,
    onClose,
}) => {
    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return '今天';
        if (days === 1) return '昨天';
        if (days < 7) return `${days}天前`;
        return date.toLocaleDateString();
    };

    return (
        <>
            <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>✨</div>
                        AI Chat
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="关闭侧边栏">✕</button>
                </div>
                <button className={styles.newChatBtn} onClick={onNewChat}>
                    <span>＋</span> 新建对话
                </button>
                <div className={styles.chatList}>
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`${styles.chatItem} ${activeChatId === chat.id ? styles.active : ''}`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <span className={styles.dot}></span>
                            <div className={styles.chatInfo}>
                                <div className={styles.chatTitle}>{chat.title}</div>
                                <div className={styles.chatDate}>{formatDate(chat.updatedAt)}</div>
                            </div>
                            <span className={styles.modelTag}>{MODEL_DISPLAY_NAMES[chat.model] || chat.model}</span>
                        </div>
                    ))}
                </div>
                <div className={styles.sidebarFooter}>
                    <UserProfile onOpenSettings={onOpenSettings} onLogout={onLogout} />
                </div>
            </div>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
        </>
    );
};

export default ChatSidebar;