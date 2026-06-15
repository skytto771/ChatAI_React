import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore, useUserStore } from '@/store';
import { useToast } from '@/context/ToastContext'
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessage from '@/components/ChatMessage';
import InputArea from '@/components/InputArea';
import TypingIndicator from '@/components/TypingIndicator';
import ModelBadge from '@/components/ModelBadge';
import EditChatModal from '@/components/EditChatModal';
import SettingsModal from '@/components/SettingsModal';
import { session } from '@/utils'
import styles from './index.module.scss';
import { useNavigate } from 'react-router';
import EmptyChat from '@/components/EmptyChat';
import type { chatSettings } from '@/types';

const Chat: React.FC = () => {
    const {
        chats,
        activeChatId,
        isResponding,
        loadChats,
        loadCurMessages,
        addMessage,
        generateAiReply,
        createNewChat,
        resume,
        setActiveChatId,
        setIsResponding,
        deleteChat,
        updateChatTitle,
        getChatModelSettings,
        updateChatModelSettings,
        loadModelSettings
    } = useChatStore();
    const toast = useToast()
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isEditChatModalOpen, setIsEditChatModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectChat, setSelectChat] = useState<any>(null);

    const activeChat = chats.length > 0 ? chats.find(c => c.id === activeChatId) : null;
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
            loadCurMessages(activeChatId).then(res=>{
                if(res.status === 'generating'){
                    setIsResponding(true)
                    resume(activeChatId,res.messageId!)
                }
            }).catch(err=>{
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
        if(messages.length === 0 || isResponding){
            isInitialMountRef.current = false
            if(isResponding){
                scrollToBottom()
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
            scrollToBottom()
        }
        
        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [activeChatId, isResponding, messages.length,activeChatLastMessage?.content,activeChatLastMessage?.reasoning]);
    function scrollToBottom() {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'instant'
            });
        }
    }

    const handleQuickCreate = async ({model,isThinking}: chatSettings) => {
        if (isResponding) {
            toast.warning('请等待当前回复完成后再创建对话');
            return;
        }
        // 调用 store 的快速创建方法（假设有一个默认创建）
        const newChatId = await createNewChat({title:'新对话',model,isThinking});
        // 可选：添加一条欢迎消息
        setActiveChatId(newChatId);
        toast.success('对话已创建');
    };

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
                scrollToBottom()
                await handleAIResponse(activeChatId);
            }catch(error){
                toast.error(error as string)
            }
        },
        [activeChatId, isResponding]
    );

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

    const openChatSettings = async (chatId: string)=>{
        const resDate = await getChatModelSettings(chatId)
        setSelectChat({ conversationId: chatId,...resDate })
        setIsEditChatModalOpen(true)
    }

    // 快捷键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsEditChatModalOpen(false);
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
                onNewChat={()=>handleSelectChat('')}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                onRenameChat={updateChatTitle}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenChatSettings={openChatSettings}
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
                {!activeChatId?<EmptyChat
                    onStartChat={handleQuickCreate}
                />:
                <>
                    <div className={styles.messagesContainer} ref={messagesContainerRef}>
                        {messages.map((message) => (
                            <ChatMessage key={message.id} role={message.role} text={message.content} reasoning={message.reasoning} isResponse={activeChatLastMessage?.id === message.id && isResponding} />
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
                </>}
            </div>
            <EditChatModal selectChat={selectChat} handelEditChatModel={updateChatModelSettings} isOpen={isEditChatModalOpen} onClose={() => setIsEditChatModalOpen(false)} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </div>
    );
};

export default Chat;