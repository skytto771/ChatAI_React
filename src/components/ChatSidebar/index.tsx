import React, { useState, useRef, useEffect } from 'react';
import { type Chat, MODEL_DISPLAY_NAMES } from '@/types';
import UserProfile from '@/components/UserProfile';
import styles from './index.module.scss';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '../ConfirmModel';

interface ChatSidebarProps {
    chats: Chat[];
    activeChatId: string;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onOpenSettings: () => void;
    onLogout: () => void;
    onDeleteChat: (chatId: string) => Promise<void>;
    isOpen: boolean;
    onClose: () => void;
    onRenameChat: (chatId: string, newTitle: string) => Promise<void>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    chats,
    activeChatId,
    onNewChat,
    onSelectChat,
    onOpenSettings,
    onRenameChat,
    onLogout,
    onDeleteChat,
    isOpen,
    onClose,
}) => {
    const toast = useToast();

    const [activePopupId, setActivePopupId] = useState<string | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [showConfirm,setShowConfirm] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const now = new Date().getTime();
        const diff = now - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return '今天';
        if (days === 1) return '昨天';
        if (days < 7) return `${days}天前`;
        return date.toLocaleDateString();
    };

    const toggleChatMenu = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        setActivePopupId(activePopupId === chatId ? null : chatId);
    };

    const closeAllPopups = () => setActivePopupId(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                closeAllPopups();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);


    const openDeleteChat = (e: React.MouseEvent,chatId: string)=>{
        e.stopPropagation();
        setShowConfirm(true);
        setSelectedChatId(chatId)
    }

    const handleDeleteChat = async () => {
        if(selectedChatId){
            try{
                await onDeleteChat(selectedChatId);
                setSelectedChatId('')
            }catch(err){
                toast.error(err as string);
            }
        }
        closeAllPopups();
        setShowConfirm(false)
    };

    const handleStartRename = (e: React.MouseEvent, chat: Chat) => {
        e.stopPropagation();
        setEditingChatId(chat.id);
        setEditTitle(chat.title);
        closeAllPopups();
        // 等待 DOM 更新后聚焦输入框
        setTimeout(() => {
            editInputRef.current?.focus();
            editInputRef.current?.select();
        }, 50);
    };

    const handleFinishRename = async () => {
        if (editingChatId && editTitle.trim()) {
            try{
                await onRenameChat(editingChatId, editTitle.trim());
            }catch(err){
                toast.error(err as string);
            }
        }
        setEditingChatId(null);
        setEditTitle('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleFinishRename();
        } else if (e.key === 'Escape') {
            setEditingChatId(null);
            setEditTitle('');
        }
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
                        <div key={chat.id} className={styles.chatItemWrapper} ref={popupRef}>
                            {editingChatId === chat.id ? 
                                <input
                                    ref={editInputRef}
                                    className={styles.renameInput}
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={handleFinishRename}
                                    onKeyDown={handleKeyDown}
                                    onClick={(e) => e.stopPropagation()}
                                    maxLength={50}
                                />:
                                <div
                                    className={`${styles.chatItem} ${activeChatId === chat.id ? styles.active : ''}`}
                                    onClick={() => onSelectChat(chat.id)}
                                >
                                    <span className={styles.dot}></span>
                                    <div className={styles.chatInfo}>
                                        <div className={styles.chatTitle}>{chat.title}</div>
                                        <div className={styles.chatDate}>{formatDate(chat.updatedAt)}</div>
                                    </div>
                                    <span className={styles.modelTag}>{MODEL_DISPLAY_NAMES[chat.model] || chat.model}</span>
                                    <button
                                        className={styles.chatActionBtn}
                                        onClick={(e) => toggleChatMenu(e, chat.id)}
                                        aria-label="更多操作"
                                    >
                                        ⋯
                                    </button>
                                </div>
                            }
                            {activePopupId === chat.id && (
                                <div className={styles.chatPopupMenu}>
                                    <button
                                        className={styles.chatPopupItem}
                                        onClick={(e) => handleStartRename(e, chat)}
                                    >
                                        <span className={styles.menuIcon}>✏️</span> 重命名
                                    </button>
                                    <button
                                        className={`${styles.chatPopupItem} ${styles.danger}`}
                                        onClick={(e)=>openDeleteChat(e,chat.id)}
                                    >
                                        <span className={styles.menuIcon}>🗑️</span> 删除会话
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className={styles.sidebarFooter}>
                    <UserProfile onOpenSettings={onOpenSettings} onLogout={onLogout} />
                </div>
            </div>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
            <ConfirmModal
                isOpen={showConfirm}
                title="删除对话"
                message="确定要删除当前对话吗？此操作不可恢复。"
                confirmText="删除"
                cancelText="取消"
                onConfirm={handleDeleteChat}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    );
};

export default ChatSidebar;