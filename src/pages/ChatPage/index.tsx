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
  const {
    chats,
    activeChatId,
    isResponding,
    loadChats,
    loadCurMessages,
    addMessage,
    generateAiReply,
    reGenerateReply,
    editMessage,
    createNewChat,
    resume,
    setActiveChatId,
    setIsResponding,
    deleteChat,
    updateChatTitle,
    getChatModelSettings,
    updateChatModelSettings,
    loadModelSettings,
    toggleChatTop,
  } = useChatStore();
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
  const isNearBottomRef = useRef(true); // 标记用户是否靠近底部

  const userMsgEleMap = useRef<Map<string, HTMLDivElement>>(new Map());

  // 加载会话信息
  useEffect(() => {
    return () => {
      loadChats().catch((err) => toast.error(err?.message || String(err)));
      loadModelSettings();
    };
  }, [loadChats]);

  // 加载聊天数据
  useEffect(() => {
    if (activeChatId) {
      loadCurMessages(activeChatId)
        .then((res) => {
          scrollToBottom();
          if (res.status === "generating") {
            setIsResponding(true);
            resume(activeChatId, res.messageId!);
          }
        })
        .catch((err) => {
          toast.error(err?.message || String(err));
        });
    }
  }, [activeChatId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const threshold = 120;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      isNearBottomRef.current =
        scrollHeight - scrollTop - clientHeight < threshold;
    };

    if (isResponding && isNearBottomRef.current) {
      scrollToBottom();
    }

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [
    activeChatId,
    isResponding,
    messages.length,
    activeChatLastMessage?.content,
    activeChatLastMessage?.reasoning,
  ]);
  function scrollToBottom() {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "instant",
      });
    }
  }

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
        scrollToBottom();
        await handleAIResponse(activeChatId);
      } catch (error: any) {
        toast.error(error?.message || String(error));
      }
    },
    [activeChatId, isResponding],
  );

  // 删除对话
  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      if (activeChatId === chatId) {
        setActiveChatId("");
      }
      toast.success("删除成功");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    }
  };

  // 切换对话
  const handleSelectChat = useCallback(
    (chatId: string) => {
      if (isResponding) {
        toast.warning("请等待当前回复完成后再切换对话");
        return;
      }
      setIsResponding(false);
      setActiveChatId(chatId);
      setIsSidebarOpen(false);
    },
    [isResponding, setIsResponding, setActiveChatId],
  );

  const scrollToMsg = (id: string) => {
    const el = userMsgEleMap.current.get(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        activeChatId={activeChatId}
        onNewChat={() => handleSelectChat("")}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={updateChatTitle}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenChatSettings={openChatSettings}
        onLogout={handleLogout}
        onToggleTop={(chatId, isTop) => toggleChatTop(chatId, isTop)}
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
                    onEdit={(messageId, newText) =>
                      editMessage(activeChatId, messageId, newText)
                    }
                    onRegenerate={() =>
                      reGenerateReply(activeChatId, message.id)
                    }
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

export default Chat;
