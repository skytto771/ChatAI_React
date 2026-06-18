import React, { useState, useRef, useEffect } from "react";
import { type Chat } from "@/types";
import UserProfile from "@/components/UserProfile";
import styles from "./index.module.scss";
import { useToast } from "@/context/ToastContext";
import ConfirmModal from "../ConfirmModel";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onOpenSettings: () => void;
  onOpenChatSettings: (chatId: string) => void;
  onLogout: () => void;
  onDeleteChat: (chatId: string) => Promise<void>;
  onToggleTop: (chatId: string, isTop: boolean) => Promise<void>;
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
  onOpenChatSettings,
  onRenameChat,
  onLogout,
  onDeleteChat,
  onToggleTop,
  isOpen,
  onClose,
}) => {
  const toast = useToast();

  const [activePopupId, setActivePopupId] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const toggleChatMenu = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setActivePopupId(activePopupId === chatId ? null : chatId);
  };

  const closeAllPopups = () => setActivePopupId(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        closeAllPopups();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const openDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setShowConfirm(true);
    setSelectedChatId(chatId);
  };

  const handleDeleteChat = async () => {
    if (selectedChatId) {
      try {
        await onDeleteChat(selectedChatId);
        setSelectedChatId("");
      } catch (err: any) {
        toast.error(err?.message || String(err));
      }
    }
    closeAllPopups();
    setShowConfirm(false);
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
      try {
        await onRenameChat(editingChatId, editTitle.trim());
      } catch (err: any) {
        toast.error(err?.message || String(err));
      }
    }
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleFinishRename();
    } else if (e.key === "Escape") {
      setEditingChatId(null);
      setEditTitle("");
    }
  };

  const pinnedChats = chats.filter((c) => c.isTop);
  const recentChats = chats.filter((c) => !c.isTop);

  // 时间分组
  const TIME_GROUPS = [
    { label: "今天", maxDays: 1 },
    { label: "3天内", maxDays: 3 },
    { label: "一周内", maxDays: 7 },
    { label: "一个月内", maxDays: 30 },
    { label: "更早", maxDays: Infinity },
  ] as const;

  const getDaysAgo = (timestamp: number): number => {
    return (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24);
  };

  const groupedRecent = TIME_GROUPS.map((g) => ({
    ...g,
    chats: recentChats.filter((c) => {
      const days = getDaysAgo(c.updatedAt);
      const prevMax = TIME_GROUPS[TIME_GROUPS.indexOf(g) - 1]?.maxDays ?? 0;
      return days < g.maxDays && days >= prevMax;
    }),
  })).filter((g) => g.chats.length > 0);

  const renderChatRow = (chat: Chat) => {
    if (editingChatId === chat.id) {
      return (
        <input
          ref={editInputRef}
          className={styles.renameInput}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleFinishRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          maxLength={50}
        />
      );
    }
    return (
      <div
        className={`${styles.chatItem} ${activeChatId === chat.id ? styles.active : ""}`}
        onClick={() => onSelectChat(chat.id)}
      >
        <span className={styles.dot}></span>
        <div className={styles.chatInfo}>
          <div className={styles.chatTitle} title={chat.title}>
            {chat.title}
          </div>
          {/* <div className={styles.chatDate}>{formatDate(chat.updatedAt)}</div> */}
        </div>
        {/* <span classNamif (condition) {
            e={styles.modelTag} title={chat.model}>
              {chat.model || MODEL_DISPLAY_NAMES[chat.model]}
            </span>
        } */}
        <button
          className={styles.chatActionBtn}
          onClick={(e) => toggleChatMenu(e, chat.id)}
          aria-label="更多操作"
        >
          ⋯
        </button>
      </div>
    );
  };

  const renderPopupMenu = (chat: Chat) => (
    <div className={styles.chatPopupMenu}>
      <button
        className={styles.chatPopupItem}
        onClick={(e) => {
          toggleChatMenu(e, chat.id);
          onToggleTop(chat.id, !chat.isTop);
        }}
      >
        <span className={styles.menuIcon}>{chat.isTop ? "📌" : "📍"}</span>{" "}
        {chat.isTop ? "取消置顶" : "置顶"}
      </button>
      <button
        className={styles.chatPopupItem}
        onClick={(e) => handleStartRename(e, chat)}
      >
        <span className={styles.menuIcon}>✏️</span> 重命名
      </button>
      <button
        className={styles.chatPopupItem}
        onClick={() => onOpenChatSettings(chat.id)}
      >
        <span className={styles.menuIcon}>⚙️</span> 设置
      </button>
      <button
        className={`${styles.chatPopupItem} ${styles.danger}`}
        onClick={(e) => openDeleteChat(e, chat.id)}
      >
        <span className={styles.menuIcon}>🗑️</span> 删除会话
      </button>
    </div>
  );

  return (
    <>
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>✨</div>
            星语
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="关闭侧边栏"
          >
            ✕
          </button>
        </div>
        <button className={styles.newChatBtn} onClick={onNewChat}>
          <span>＋</span> 新建对话
        </button>
        <div className={styles.chatList}>
          {pinnedChats.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>📌 置顶</div>
              {pinnedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={styles.chatItemWrapper}
                  ref={popupRef}
                >
                  {renderChatRow(chat)}
                  {activePopupId === chat.id && renderPopupMenu(chat)}
                </div>
              ))}
            </div>
          )}
          {pinnedChats.length > 0 && recentChats.length > 0 && (
            <div className={styles.sectionDivider} />
          )}
          {groupedRecent.map((group) => (
            <div key={group.label} className={styles.section}>
              <div className={styles.sectionHeader}>{group.label}</div>
              {group.chats.map((chat) => (
                <div
                  key={chat.id}
                  className={styles.chatItemWrapper}
                  ref={popupRef}
                >
                  {renderChatRow(chat)}
                  {activePopupId === chat.id && renderPopupMenu(chat)}
                </div>
              ))}
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
