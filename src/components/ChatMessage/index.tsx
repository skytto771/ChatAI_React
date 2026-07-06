import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  type KeyboardEvent,
} from "react";
import styles from "./index.module.scss";
import "@/assets/styles/markdown.scss";
import { CopyIcon, EditIcon, RegenerateIcon, COPY_ICON_SVG_STRING } from "@/components/Icons";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  messageId: string;
  reasoning?: string;
  text: string;
  htmlText?: string;
  isResponse: boolean;
  onEdit?: (messageId: string, text: string) => void;
  onRegenerate?: (messageId: string) => void;
}

const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      role,
      messageId,
      text,
      htmlText,
      reasoning,
      isResponse,
      onEdit,
      onRegenerate,
    },
    ref,
  ) => {
    const avatarContent = role === "assistant" ? "🤖" : "👤";
    const [isCopied, setIsCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const editTextareaRef = useRef<HTMLTextAreaElement>(null);
    const mdBodyRef = useRef<HTMLDivElement>(null);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("复制失败:", err);
      }
    };

    /** 进入编辑模式 */
    const handleEdit = () => {
      setEditText(text);
      setIsEditing(true);
    };

    /** 保存编辑并退出 */
    const handleEditSave = () => {
      const trimmed = editText.trim();
      if (trimmed && trimmed !== text) {
        onEdit?.(messageId, trimmed);
      }
      setIsEditing(false);
    };

    /** 取消编辑 */
    const handleEditCancel = () => {
      setIsEditing(false);
      setEditText(text);
    };

    /** 编辑区键盘事件：Enter 发送，Escape 取消 */
    const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleEditSave();
      } else if (e.key === "Escape") {
        handleEditCancel();
      }
    };

    /** 编辑区自适应高度 */
    const handleEditInput = () => {
      const el = editTextareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
      }
    };

    // 进入编辑模式时，初始自适应高度
    useEffect(() => {
      if (isEditing && editTextareaRef.current) {
        // 等 DOM 渲染完成后调整
        requestAnimationFrame(() => {
          const el = editTextareaRef.current;
          if (el) {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }
        });
      }
    }, [isEditing]);

    // 为代码块注入复制按钮
    useEffect(() => {
      const container = mdBodyRef.current;
      if (!container || !htmlText) return;

      const preEls = container.querySelectorAll("pre");
      preEls.forEach((pre) => {
        // 避免重复注入
        if (pre.querySelector(".code-copy-btn")) return;

        const btn = document.createElement("button");
        btn.className = "code-copy-btn";
        btn.innerHTML = `${COPY_ICON_SVG_STRING}<span>复制</span>`;
        btn.title = "复制代码";

        btn.addEventListener("click", async () => {
          const code = pre.querySelector("code");
          const codeText = code?.textContent || "";
          try {
            await navigator.clipboard.writeText(codeText);
            btn.classList.add("copied");
            const label = btn.querySelector("span");
            if (label) label.textContent = "已复制";
            setTimeout(() => {
              btn.classList.remove("copied");
              if (label) label.textContent = "复制";
            }, 2000);
          } catch (err) {
            console.error("复制代码失败:", err);
          }
        });

        pre.appendChild(btn);
      });
    }, [htmlText]);

    const handleRegenerate = () => {
      if (!onRegenerate) return;
      onRegenerate(messageId);
    };

    // 工具栏按钮配置
    const getToolbarButtons = () => {
      const buttons = [];

      // 复制按钮（所有消息都有）
      buttons.push({
        icon: isCopied ? (
          "✅"
        ) : (
          <CopyIcon size={16} />
        ),
        label: isCopied ? "已复制" : "复制",
        onClick: handleCopy,
        className: isCopied ? styles.copied : "",
      });

      // 编辑按钮（仅用户消息）
      if (role === "user") {
        buttons.push({
          icon: <EditIcon size={16} />,
          label: "编辑",
          onClick: handleEdit,
        });
      }

      // 重新生成按钮（仅助手消息，且不在流式输出中）
      if (role === "assistant") {
        buttons.push({
          icon: <RegenerateIcon size={16} />,
          label: "重新生成",
          onClick: handleRegenerate,
        });
      }

      return buttons;
    };

    return (
      <div
        className={`${styles.message} ${styles[role]} ${isEditing ? styles.editingMessage : ""}`}
      >
        <div className={styles.avatar}>{avatarContent}</div>
        {role === "assistant" ? (
          <div className={styles.bubbleWrapper}>
            <div className={`${styles.bubble}`}>
              {reasoning && isResponse && (
                <p
                  className={`${styles.thinkingMessage} ${isResponse ? styles.streaming : ""}`}
                >
                  {reasoning}
                </p>
              )}
              {htmlText && (
                <div
                  ref={mdBodyRef}
                  className={`md-body`}
                  dangerouslySetInnerHTML={{ __html: htmlText }}
                />
              )}
            </div>
            {/* 工具栏 */}
            <div className={styles.toolbar}>
              {getToolbarButtons().map((btn, index) => (
                <button
                  key={index}
                  className={`${styles.toolbarBtn} ${btn.className || ""}`}
                  onClick={btn.onClick}
                  title={btn.label}
                >
                  <span className={styles.btnIcon}>{btn.icon}</span>
                  <span className={styles.btnLabel}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.bubbleWrapper}>
            <div ref={ref} className={`${styles.bubble} ${styles.messageText}`}>
              {isEditing ? (
                <div className={styles.editWrapper}>
                  <textarea
                    ref={editTextareaRef}
                    className={styles.editInput}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onInput={handleEditInput}
                    rows={1}
                    placeholder="编辑消息... (Enter 发送, Esc 取消)"
                    autoFocus
                  />
                  <div className={styles.editActions}>
                    <button
                      className={styles.cancelEditBtn}
                      onClick={handleEditCancel}
                    >
                      取消
                    </button>
                    <button
                      className={styles.sendEditBtn}
                      onClick={handleEditSave}
                      title="发送"
                    >
                      发送
                    </button>
                  </div>
                </div>
              ) : (
                text
              )}
            </div>
            {/* 工具栏 */}
            <div className={styles.toolbar}>
              {getToolbarButtons().map((btn, index) => (
                <button
                  key={index}
                  className={`${styles.toolbarBtn} ${btn.className || ""}`}
                  onClick={btn.onClick}
                  title={btn.label}
                >
                  <span className={styles.btnIcon}>{btn.icon}</span>
                  <span className={styles.btnLabel}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

ChatMessage.displayName = "ChatMessage";

export default React.memo(ChatMessage);
