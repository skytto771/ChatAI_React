import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '@/types';
import { useChatStore } from '@/store/chatStore';
import { useUser } from '@/context/UserContext';
import { generateSmartReply } from '@/utils/aiReplyGenerator';
import { useToast } from '@/context/ToastContext'
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessage from '@/components/ChatMessage';
import InputArea from '@/components/InputArea';
import TypingIndicator from '@/components/TypingIndicator';
import ModelBadge from '@/components/ModelBadge';
import NewChatModal from '@/components/NewChatModal';
import SettingsModal from '@/components/SettingsModal';
import styles from './index.module.scss';

const Chat: React.FC = () => {
    const {
        chats,
        activeChatId,
        isResponding,
        loadChats,
        addMessage,
        setActiveChatId,
        setIsResponding,
        updateChatTitle,
    } = useChatStore();
    const toast = useToast()
    const { settings } = useUser();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const responseTimeoutRef = useRef<number | null>(null);
    const activeChat = chats.find(c => c.id === activeChatId);

    // 加载聊天数据
    useEffect(() => {
        loadChats(settings.defaultModel);
    }, [loadChats, settings.defaultModel]);

    // 滚动到底部
    const scrollToBottom = useCallback(() => {
        if (settings.autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [settings.autoScroll]);

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages, isResponding, scrollToBottom]);

    // 清理定时器
    const clearResponseTimeout = useCallback(() => {
        if (responseTimeoutRef.current) {
            clearTimeout(responseTimeoutRef.current);
            responseTimeoutRef.current = null;
        }
    }, []);

    // 播放提示音
    const playSound = useCallback(() => {
        if (settings.soundEnabled) {
            // 简单的提示音（使用 Web Audio 或空函数，实际可加音频）
            // 此处为简化，仅模拟 console
            console.log('🔔 提示音 (可接入实际音频)');
        }
    }, [settings.soundEnabled]);

    // 添加消息并滚动
    const handleAddMessage = useCallback((chatId: string, role: 'user' | 'ai', text: string) => {
        addMessage(chatId, role, text);
        if (role === 'ai') playSound();
    }, [addMessage, playSound]);

    // 模拟 AI 回复
    const simulateAIResponse = useCallback(
        (chatId: string, userMessage: string) => {
            clearResponseTimeout();
            setIsResponding(true);

            responseTimeoutRef.current = setTimeout(() => {
                const chat = chats.find(c => c.id === chatId);
                const reply = generateSmartReply(
                    userMessage,
                    chat?.systemPrompt || '',
                    chat?.userPrompt || ''
                );
                handleAddMessage(chatId, 'ai', reply);
                setIsResponding(false);
                responseTimeoutRef.current = null;
            }, 1000 + Math.random() * 1500);
        },
        [clearResponseTimeout, setIsResponding, chats, handleAddMessage]
    );

    // 发送消息
    const handleSendMessage = useCallback(
        (text: string) => {
            if (isResponding || !activeChatId) return;

            handleAddMessage(activeChatId, 'user', text);

            // 如果是新对话且标题还是默认的，更新标题
            const currentChat = chats.find(c => c.id === activeChatId);
            if (currentChat && currentChat.title === '新对话' && currentChat.messages.length === 0) {
                const newTitle = text.slice(0, 20) + (text.length > 20 ? '...' : '');
                updateChatTitle(activeChatId, newTitle);
            }

            simulateAIResponse(activeChatId, text);
        },
        [activeChatId, isResponding, handleAddMessage, chats, updateChatTitle, simulateAIResponse]
    );

    // 新建对话按钮
    const handleNewChat = () => {
        if (isResponding) {
            toast.warning('请等待当前回复完成后再新建对话');
            return;
        }
        setIsNewChatModalOpen(true);
        setIsSidebarOpen(false);
    };

    // 切换对话
    const handleSelectChat = useCallback(
        (chatId: string) => {
            if (isResponding) {
                toast.warning('请等待当前回复完成后再切换对话');
                return;
            }
            clearResponseTimeout();
            setIsResponding(false);
            setActiveChatId(chatId);
            setIsSidebarOpen(false);
        },
        [isResponding, clearResponseTimeout, setIsResponding, setActiveChatId]
    );

    // 登出
    const handleLogout = () => {
        toast.success('👋 已登出，演示模式');
        // 实际可跳转登录页
    };

    // 快捷键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsNewChatModalOpen(false);
                setIsSettingsModalOpen(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                setIsSettingsModalOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 组件卸载清理
    useEffect(() => {
        return () => clearResponseTimeout();
    }, [clearResponseTimeout]);

    const messages = activeChat?.messages || [];

    return (
        <div className={styles.chat}>
            <ChatSidebar
                chats={chats}
                activeChatId={activeChatId}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className={styles.main}>
                <div className={styles.chatHeader}>
                    <button className={styles.menuToggle} onClick={() => setIsSidebarOpen(true)} aria-label="打开菜单">☰</button>
                    <h2>🤖 智能对话</h2>
                    {activeChat && <ModelBadge model={activeChat.model} />}
                    <span className={styles.statusBadge}>● 在线</span>
                </div>
                <div className={styles.messagesContainer}>
                    {messages.map((message) => (
                        <ChatMessage key={message.id} role={message.role} text={message.text} />
                    ))}
                    {isResponding && (
                        <div className={`${styles.message} ${styles.ai}`}>
                            <div className={styles.avatar}>🤖</div>
                            <div className={styles.bubble}>
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <InputArea onSend={handleSendMessage} disabled={isResponding} />
            </div>
            <NewChatModal isOpen={isNewChatModalOpen} onClose={() => setIsNewChatModalOpen(false)} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </div>
    );
};

export default Chat;