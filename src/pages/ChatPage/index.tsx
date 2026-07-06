import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChatStore } from "@/store";
import { useToast } from "@/context/ToastContext";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import InputArea from "@/components/InputArea";
import ModelBadge from "@/components/ModelBadge";
import EditChatModal from "@/components/EditChatModal";
import SettingsModal from "@/components/SettingsModal";
import { session } from "@/utils";
import styles from "./index.module.scss";
import { useNavigate } from "react-router";
import EmptyChat from "@/components/EmptyChat";
import type { chatSettings } from "@/types";
import MessageNav from "./components/MessageNav";

const Chat: React.FC = () => {
  // 精确 selector 订阅 —— 仅在关心的数据变化时重渲染
  const chats = useChatStore((s) => s.chats);
  const archivedChats = useChatStore((s) => s.archivedChats);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const isResponding = useChatStore((s) => s.isResponding);

  // actions 引用稳定，用 getState 一次性获取
  const {
    initPage,
    loadArchivedChats,
    restoreChat,
    addMessage,
    generateAiReply,
    reGenerateReply,
    editMessage,
    createNewChat,
    resume,
    setActiveChatId,
    setIsResponding,
    archiveChat,
    deleteArchivedChat,
    clearArchivedChats,
    updateChatTitle,
    getChatModelSettings,
    updateChatModelSettings,
    toggleChatTop,
  } = useChatStore.getState();
  const toast = useToast();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditChatModalOpen, setIsEditChatModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectChat, setSelectChat] = useState<any>(null);

  const activeChat =
    chats.length > 0 ? chats.find((c) => c.id === activeChatId) : null;
  const messages = activeChat?.messages || [];
  const activeChatLastMessage = messages[messages.length - 1];

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false); // 用户主动向上滚 → 停止自动跟底
  const isAutoScrollingRef = useRef(false); // 标记本次滚动是程序触发，非用户操作

  const userMsgEleMap = useRef<Map<string, HTMLDivElement>>(new Map());

  // 加载会话信息（首次进入）
  useEffect(() => {
    initPage()
      .then((res) => {
        forceScrollToBottom();
        if (res.status === "generating") {
          setIsResponding(true);
          resume(res.chatId, res.messageId!);
        }
      })
      .catch((err) => toast.error(err?.message || String(err)));
  }, []);

  // 切换对话时加载消息（仅首次切换到该对话时触发）
  useEffect(() => {
    if (!activeChatId) return;
    const store = useChatStore.getState();
    const chat = store.chats.find((c: any) => c.id === activeChatId);
    if (chat?.messages?.length) {
      forceScrollToBottom();
      return;
    }
    store
      .loadCurMessages(activeChatId)
      .then((res) => {
        forceScrollToBottom();
        if (res.status === "generating") {
          setIsResponding(true);
          store.resume(activeChatId, res.messageId!);
        }
      })
      .catch((err) => toast.error(err?.message || String(err)));
  }, [activeChatId]);

  // scroll 事件监听 — 区分用户滚动 vs 程序滚动
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    userScrolledUpRef.current = false;

    const handleScroll = () => {
      if (isAutoScrollingRef.current) return; // 程序触发的滚动，忽略
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 2;
      userScrolledUpRef.current = !atBottom; // 离开底部 = 用户滚走了
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeChatId]);

  // 强制滚底（发送消息、切换对话等一次性操作）
  function forceScrollToBottom() {
    userScrolledUpRef.current = false;
    setTimeout(() => {
      const container = messagesContainerRef.current;
      if (container) {
        isAutoScrollingRef.current = true;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "instant",
        });
        isAutoScrollingRef.current = false;
      }
    }, 0);
  }

  // RAF 节流的自动跟底（流式期间每帧最多 1 次）
  const scrollRafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(
    null,
  );
  const scrollToBottom = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const container = messagesContainerRef.current;
      if (container && !userScrolledUpRef.current) {
        isAutoScrollingRef.current = true;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "instant",
        });
        isAutoScrollingRef.current = false;
      }
    });
  }, []);

  // 流式更新时自动跟底
  useEffect(() => {
    if (isResponding && !userScrolledUpRef.current) {
      scrollToBottom();
    }
  }, [
    isResponding,
    messages.length,
    activeChatLastMessage?.content,
    activeChatLastMessage?.reasoning,
    scrollToBottom,
  ]);

  const setRef = useCallback(
    (id: string) => (node: HTMLDivElement | null) => {
      if (node) {
        userMsgEleMap.current.set(id, node);
      } else {
        userMsgEleMap.current.delete(id);
      }
    },
    [],
  );

  const handleQuickCreate = async ({ model, isThinking }: chatSettings) => {
    if (isResponding) {
      toast.warning("请等待当前回复完成后再创建对话");
      return;
    }
    // 调用 store 的快速创建方法（假设有一个默认创建）
    const newChatId = await createNewChat({
      title: "新对话",
      model,
      isThinking,
    });
    // 可选：添加一条欢迎消息
    setActiveChatId(newChatId);
    toast.success("对话已创建");
  };

  const handleAIResponse = useCallback(
    async (chatId: string) => {
      setIsResponding(true);
      try {
        await generateAiReply(chatId);
        setIsResponding(false);
      } catch (error: any) {
        toast.error(error?.message || String(error));
      }
    },
    [setIsResponding],
  );

  // 发送消息
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (isResponding || !activeChatId) return;
      try {
        setIsResponding(true);
        await addMessage(activeChatId, "user", text, 0);
        forceScrollToBottom();
        await handleAIResponse(activeChatId);
      } catch (error: any) {
        toast.error(error?.message || String(error));
      }
    },
    [activeChatId, isResponding],
  );

  // 归档对话
  const handleArchiveChat = async (chatId: string) => {
    try {
      await archiveChat(chatId);
      if (activeChatId === chatId) {
        setActiveChatId("");
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    }
  };

  // 删除单个归档对话
  const handleDeleteArchivedChat = async (chatId: string) => {
    await deleteArchivedChat(chatId);
  };

  // 清空所有归档对话
  const handleClearArchivedChats = async () => {
    await clearArchivedChats();
  };

  // 切换对话
  const handleSelectChat = useCallback(
    (chatId: string) => {
      setIsResponding(false);
      setActiveChatId(chatId);
      setIsSidebarOpen(false);
    },
    [isResponding, setIsResponding, setActiveChatId],
  );

  // useCallback 保证 ChatMessage / MessageNav React.memo 生效
  const handleEditMessage = useCallback(
    (messageId: string, newText: string) => {
      const id = useChatStore.getState().activeChatId;
      editMessage(id, messageId, newText);
    },
    [editMessage],
  );

  const handleRegenerateMessage = useCallback(
    (messageId: string) => {
      const id = useChatStore.getState().activeChatId;
      reGenerateReply(id, messageId);
    },
    [reGenerateReply],
  );

  const scrollToMsg = useCallback((id: string) => {
    const el = userMsgEleMap.current.get(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // 登出
  const handleLogout = async () => {
    session.delSession();
    navigate("/login");
  };

  const openChatSettings = async (chatId: string) => {
    const resDate = await getChatModelSettings(chatId);
    setSelectChat({ conversationId: chatId, ...resDate });
    setIsEditChatModalOpen(true);
  };

  return (
    <div className={styles.chat}>
      <ChatSidebar
        chats={chats}
        archivedChats={archivedChats}
        activeChatId={activeChatId}
        onNewChat={() => handleSelectChat("")}
        onSelectChat={handleSelectChat}
        onArchiveChat={handleArchiveChat}
        onRenameChat={updateChatTitle}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenChatSettings={openChatSettings}
        onLogout={handleLogout}
        onToggleTop={(chatId, isTop) => toggleChatTop(chatId, isTop)}
        onLoadArchivedChats={loadArchivedChats}
        onRestoreChat={restoreChat}
        onDeleteArchivedChat={handleDeleteArchivedChat}
        onClearArchivedChats={handleClearArchivedChats}
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
          <h2>🤖 {activeChat?.title || "智能对话"}</h2>
          {activeChat && <ModelBadge model={activeChat.model} />}
          <span className={styles.statusBadge}>● 在线</span>
        </div>
        {!activeChatId ? (
          <EmptyChat onStartChat={handleQuickCreate} />
        ) : (
          <>
            <div className={styles.chatArea}>
              <div
                className={styles.messagesContainer}
                ref={messagesContainerRef}
              >
                {messages.map((message) => (
                  <ChatMessage
                    ref={setRef(message.id)}
                    key={message.id}
                    messageId={message.id}
                    role={message.role}
                    text={message.content}
                    htmlText={message.contentMd}
                    reasoning={message.reasoning}
                    isResponse={
                      activeChatLastMessage?.id === message.id && isResponding
                    }
                    onEdit={handleEditMessage}
                    onRegenerate={handleRegenerateMessage}
                  />
                ))}
              </div>
              <MessageNav messages={messages} onSelect={scrollToMsg} />
            </div>
            <InputArea
              onUpdateSetting={updateChatModelSettings}
              chat={activeChat!}
              onSend={handleSendMessage}
              disabled={isResponding}
            />
          </>
        )}
      </div>
      <EditChatModal
        selectChat={selectChat}
        handelEditChatModel={updateChatModelSettings}
        isOpen={isEditChatModalOpen}
        onClose={() => setIsEditChatModalOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default React.memo(Chat);
