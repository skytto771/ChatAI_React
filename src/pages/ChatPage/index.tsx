import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore, useUserStore } from '@/store';
import { useToast } from '@/context/ToastContext'
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessage from '@/components/ChatMessage';
import InputArea from '@/components/InputArea';
import TypingIndicator from '@/components/TypingIndicator';
import ModelBadge from '@/components/ModelBadge';
import NewChatModal from '@/components/NewChatModal';
import SettingsModal from '@/components/SettingsModal';
import { session } from '@/utils'
import styles from './index.module.scss';
import { useNavigate } from 'react-router';

const Chat: React.FC = () => {
    const {
        chats,
        activeChatId,
        isResponding,
        loadChats,
        loadCurMessages,
        addMessage,
        generateAiReply,
        setActiveChatId,
        setIsResponding,
        deleteChat,
        updateChatTitle,
        loadModelSettings
    } = useChatStore();
    const toast = useToast()
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const activeChat = chats.find(c => c.id === activeChatId);
    const messages = activeChat?.messages || [];
    const activeChatLastMessage = messages[messages.length - 1]

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true); // 标记用户是否靠近底部

    const isInitialMountRef = useRef(true);
    const previousChatIdRef = useRef(activeChatId);

    // 加载会话信息
    useEffect(() => {
        return ()=>{
            loadChats().catch(err=>toast.error(err));
        }
    }, [loadChats]);

    // 加载聊天数据
    useEffect(() => {
        if (activeChatId) {
            loadCurMessages(activeChatId).catch(err=>{
                toast.error(err);
            })
        }
    }, [activeChatId]);

    // 切换会话时重置滚动相关状态
    useEffect(() => {
        if (previousChatIdRef.current !== activeChatId) {
            // 会话切换，重置滚动恢复标记
            isInitialMountRef.current = true;
            previousChatIdRef.current = activeChatId;
        }
    }, [activeChatId]);

    // 统一的滚动控制
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        
        const threshold = 120;
        
        // 恢复滚动位置（初始化）
        const scrollPositions = JSON.parse(localStorage.getItem('conversations_scrollTop') || '{}');
        const savedScrollTop = scrollPositions[activeChatId];
        if (savedScrollTop !== undefined && !isResponding) {
            if(savedScrollTop !== 0){
                // 等待 DOM 完全渲染
                const waitForStableHeight = () => {
                    const currentHeight = container.scrollHeight;
                    requestAnimationFrame(() => {
                        const newHeight = container.scrollHeight;
                        if (newHeight === currentHeight) {
                            // 高度稳定了，执行滚动
                            container.scrollTo({
                                top: savedScrollTop,
                                behavior: 'smooth'
                            });
                            if(savedScrollTop <= newHeight){
                                isInitialMountRef.current = false
                            }
                        } else {
                            // 高度还在变化，重试
                            waitForStableHeight();
                        }
                    });
                };
                waitForStableHeight();
            }
        }
        
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < threshold;
            // 切换完成后才存储
            if (!isInitialMountRef.current && !isResponding) {
                const newPositions = JSON.parse(localStorage.getItem('conversations_scrollTop') || '{}');
                newPositions[activeChatId] = scrollTop;
                localStorage.setItem('conversations_scrollTop', JSON.stringify(newPositions));
            }
        };

        if (isResponding && isNearBottomRef.current && !isInitialMountRef.current) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'auto' // 流式响应中用 auto，不要用 smooth
            });
        }
        
        container.addEventListener('scroll', handleScroll);
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [activeChatId, isResponding, messages.length,activeChatLastMessage?.content]);

    const handleAIResponse = useCallback(
        async (chatId: string) => {
            setIsResponding(true);
            try{
                await generateAiReply(chatId)
                setIsResponding(false);
            }catch(error){
                toast.error(error as string);
            }
        },
        [ setIsResponding]
    );

    // 发送消息
    const handleSendMessage = useCallback(
        async (text: string) => {
            if (isResponding || !activeChatId) return;
            try{
                setIsResponding(true);
                await addMessage(activeChatId, 'user', text, 0);
                await handleAIResponse(activeChatId);
            }catch(error){
                toast.error(error as string)
            }
        },
        [activeChatId, isResponding]
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

    // 删除对话
    const handleDeleteChat = async (chatId: string) => {
        try{
            await deleteChat(chatId);
            if (activeChatId === chatId) {
                setActiveChatId('');
            }
            toast.success('删除成功');
        }catch(err){
            toast.error(err as string);
        }
    }

    // 切换对话
    const handleSelectChat = useCallback(
        (chatId: string) => {
            if (isResponding) {
                toast.warning('请等待当前回复完成后再切换对话');
                return;
            }
            setIsResponding(false);
            setActiveChatId(chatId);
            setIsSidebarOpen(false);
        },
        [isResponding, setIsResponding, setActiveChatId]
    );

    // 登出
    const handleLogout = async () => {
        session.delSession()
        navigate('/login');
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
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            try{
                loadModelSettings()
            }catch(err){
                toast.error(err as string)}
        }
    }, []);

    return (
        <div className={styles.chat}>
            <ChatSidebar
                chats={chats}
                activeChatId={activeChatId}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                onRenameChat={updateChatTitle}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className={styles.main}>
                <div className={styles.chatHeader}>
                    <button className={styles.menuToggle} onClick={() => setIsSidebarOpen(true)} aria-label="打开菜单">☰</button>
                    <h2>🤖 {activeChat?.title || '智能对话'}</h2>
                    {activeChat && <ModelBadge model={activeChat.model} />}
                    <span className={styles.statusBadge}>● 在线</span>
                </div>
                <div className={styles.messagesContainer} ref={messagesContainerRef}>
                    {messages.map((message) => (
                        <ChatMessage key={message.id} role={message.role} text={message.content} />
                    ))}
                    {isResponding && (
                        <div className={`${styles.message} ${styles.ai}`}>
                            <div className={styles.avatar}>🤖</div>
                            <div className={styles.bubble}>
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                </div>
                <InputArea onSend={handleSendMessage} disabled={isResponding} />
            </div>
            <NewChatModal isOpen={isNewChatModalOpen} onClose={() => setIsNewChatModalOpen(false)} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </div>
    );
};

export default Chat;