import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat, Message } from '@/types';
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessage from '@/components/ChatMessage';
import InputArea from '@/components/InputArea';
import TypingIndicator from '@/components/TypingIndicator';
import { generateSmartReply } from '@/utils/aiReplyGenerator';
import styles from './index.module.scss';

const STORAGE_KEY = 'ai-chat-data';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getInitialChats = (): Chat[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            // 解析失败，使用默认数据
        }
    }

    const now = Date.now();
    return [
        {
            id: '1',
            title: '今天的灵感探讨',
            messages: [
                {
                    id: generateId(),
                    role: 'ai',
                    text: '你好！我是 AI 助手，可以帮你写作、编程、解答问题。<br>试试问我些什么吧 ✨',
                    timestamp: now,
                },
            ],
            createdAt: now,
            updatedAt: now,
        },
        {
            id: '2',
            title: '代码调试助手',
            messages: [
                {
                    id: generateId(),
                    role: 'ai',
                    text: '👨‍💻 代码调试模式已启动。请描述你遇到的问题。',
                    timestamp: now,
                },
            ],
            createdAt: now,
            updatedAt: now,
        },
        {
            id: '3',
            title: '周末旅行计划',
            messages: [
                {
                    id: generateId(),
                    role: 'ai',
                    text: '🌍 旅行计划助手已就绪！你想去哪里探险？',
                    timestamp: now,
                },
            ],
            createdAt: now,
            updatedAt: now,
        },
    ];
};

const ChatPage: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>(getInitialChats);
    const [activeChatId, setActiveChatId] = useState<string>('1');
    const [isResponding, setIsResponding] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const responseTimeoutRef = useRef<number | null>(null);

    const activeChat = chats.find((c) => c.id === activeChatId);

    // 保存聊天数据到 localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }, [chats]);

    // 滚动到底部
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

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

    // 添加消息到指定聊天
    const addMessage = useCallback((chatId: string, role: 'user' | 'ai', text: string) => {
        const newMessage: Message = {
            id: generateId(),
            role,
            text,
            timestamp: Date.now(),
        };

        setChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId
                    ? {
                        ...chat,
                        messages: [...chat.messages, newMessage],
                        updatedAt: Date.now(),
                    }
                    : chat
            )
        );
    }, []);

    // 更新聊天标题
    const updateChatTitle = useCallback((chatId: string, firstUserMessage: string) => {
        const title = firstUserMessage.slice(0, 20) + (firstUserMessage.length > 20 ? '...' : '');
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId && chat.title === '新对话'
                    ? { ...chat, title }
                    : chat
            )
        );
    }, []);

    // 模拟 AI 回复
    const simulateAIResponse = useCallback(
        (chatId: string, userMessage: string) => {
            clearResponseTimeout();

            setIsResponding(true);

            responseTimeoutRef.current = setTimeout(() => {
                const reply = generateSmartReply(userMessage);
                addMessage(chatId, 'ai', reply);
                setIsResponding(false);
                responseTimeoutRef.current = null;
            }, 1000 + Math.random() * 1500);
        },
        [addMessage, clearResponseTimeout]
    );

    // 发送消息
    const handleSendMessage = useCallback(
        (text: string) => {
            if (isResponding) return;

            // 添加用户消息
            addMessage(activeChatId, 'user', text);

            // 如果是新对话且标题还是默认的，更新标题
            const currentChat = chats.find((c) => c.id === activeChatId);
            if (currentChat && currentChat.title === '新对话') {
                updateChatTitle(activeChatId, text);
            }

            // 模拟 AI 回复
            simulateAIResponse(activeChatId, text);
        },
        [activeChatId, isResponding, addMessage, chats, updateChatTitle, simulateAIResponse]
    );

    // 新建对话
    const handleNewChat = useCallback(() => {
        if (isResponding) {
            alert('请等待当前回复完成后再新建对话。');
            return;
        }

        clearResponseTimeout();
        setIsResponding(false);

        const now = Date.now();
        const newChat: Chat = {
            id: generateId(),
            title: '新对话',
            messages: [
                {
                    id: generateId(),
                    role: 'ai',
                    text: '✨ 新对话已创建！尽管问我任何问题。',
                    timestamp: now,
                },
            ],
            createdAt: now,
            updatedAt: now,
        };

        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setIsSidebarOpen(false);
    }, [isResponding, clearResponseTimeout]);

    // 切换对话
    const handleSelectChat = useCallback(
        (chatId: string) => {
            if (isResponding) {
                alert('请等待当前回复完成后再切换对话。');
                return;
            }

            clearResponseTimeout();
            setIsResponding(false);
            setActiveChatId(chatId);
            setIsSidebarOpen(false);
        },
        [isResponding, clearResponseTimeout]
    );

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            clearResponseTimeout();
        };
    }, [clearResponseTimeout]);

    // 当前聊天的消息列表
    const messages = activeChat?.messages || [];

    return (
        <div className={styles.chat}>
            <ChatSidebar
                chats={chats}
                activeChatId={activeChatId}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className={styles.main}>
                <div className={styles.chatHeader}>
                    <button
                        className={styles.menuToggle}
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="打开菜单"
                    >
                        ☰
                    </button>
                    <h2>🤖 智能对话</h2>
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
        </div>
    );
};

export default ChatPage;