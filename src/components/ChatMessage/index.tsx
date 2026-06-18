import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  type KeyboardEvent,
} from "react";
import styles from "./index.module.scss";
import "@/assets/styles/markdown.scss";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  messageId: string;
  reasoning?: string;
  text: string;
  htmlText?: string;
  isResponse: boolean;
  onEdit?: (messageId: string, text: string) => void;
  onRegenerate?: () => void;
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

    const handleRegenerate = () => {
      if (!onRegenerate) return;
      onRegenerate();
    };

    // 工具栏按钮配置
    const getToolbarButtons = () => {
      const buttons = [];

      // 复制按钮（所有消息都有）
      buttons.push({
        icon: isCopied ? (
          "✅"
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.14929 4.02032C7.11197 4.02032 7.87983 4.02016 8.49597 4.07598C9.12128 4.13269 9.65792 4.25188 10.1415 4.53106C10.7202 4.8653 11.2008 5.3459 11.535 5.92462C11.8142 6.40818 11.9334 6.94481 11.9901 7.57012C12.0459 8.18625 12.0458 8.95419 12.0458 9.9168C12.0458 10.8795 12.0459 11.6473 11.9901 12.2635C11.9334 12.8888 11.8142 13.4254 11.535 13.909C11.2008 14.4877 10.7202 14.9683 10.1415 15.3025C9.65792 15.5817 9.12128 15.7009 8.49597 15.7576C7.87984 15.8134 7.11196 15.8133 6.14929 15.8133C5.18667 15.8133 4.41874 15.8134 3.80261 15.7576C3.1773 15.7009 2.64067 15.5817 2.1571 15.3025C1.5784 14.9683 1.09778 14.4877 0.76355 13.909C0.484366 13.4254 0.365184 12.8888 0.308472 12.2635C0.252649 11.6473 0.252808 10.8795 0.252808 9.9168C0.252808 8.95418 0.252664 8.18625 0.308472 7.57012C0.365184 6.94481 0.484366 6.40818 0.76355 5.92462C1.09777 5.34589 1.57839 4.86529 2.1571 4.53106C2.64067 4.25188 3.1773 4.13269 3.80261 4.07598C4.41874 4.02017 5.18666 4.02032 6.14929 4.02032ZM6.14929 5.37774C5.16181 5.37774 4.46634 5.37761 3.92566 5.42657C3.39434 5.47472 3.07859 5.56574 2.83582 5.70587C2.4632 5.92106 2.15354 6.2307 1.93835 6.60333C1.79823 6.8461 1.70721 7.16185 1.65906 7.69317C1.6101 8.23385 1.61023 8.92933 1.61023 9.9168C1.61023 10.9043 1.61009 11.5998 1.65906 12.1404C1.70721 12.6717 1.79823 12.9875 1.93835 13.2303C2.15356 13.6029 2.46321 13.9126 2.83582 14.1277C3.07859 14.2679 3.39434 14.3589 3.92566 14.407C4.46634 14.456 5.16182 14.4559 6.14929 14.4559C7.13682 14.4559 7.83224 14.456 8.37292 14.407C8.90425 14.3589 9.21999 14.2679 9.46277 14.1277C9.83535 13.9126 10.145 13.6029 10.3602 13.2303C10.5004 12.9875 10.5914 12.6717 10.6395 12.1404C10.6885 11.5998 10.6884 10.9043 10.6884 9.9168C10.6884 8.92934 10.6885 8.23384 10.6395 7.69317C10.5914 7.16185 10.5004 6.8461 10.3602 6.60333C10.1451 6.23071 9.83536 5.92107 9.46277 5.70587C9.21999 5.56574 8.90424 5.47472 8.37292 5.42657C7.83224 5.3776 7.13682 5.37774 6.14929 5.37774ZM9.80164 0.367975C10.7638 0.367975 11.5314 0.36788 12.1473 0.423639C12.7726 0.480307 13.3093 0.598759 13.7928 0.877741C14.3717 1.21192 14.8521 1.69355 15.1864 2.27227C15.4655 2.75574 15.5857 3.29164 15.6425 3.9168C15.6983 4.53301 15.6971 5.3016 15.6971 6.26446V7.82989C15.6971 8.29264 15.6989 8.58993 15.6649 8.84844C15.4668 10.3525 14.401 11.5738 12.9833 11.9988V10.5467C13.6973 10.1903 14.2105 9.49662 14.3192 8.67169C14.3387 8.52347 14.3407 8.3358 14.3407 7.82989V6.26446C14.3407 5.27706 14.3398 4.58149 14.2909 4.04083C14.2428 3.50968 14.1526 3.19372 14.0126 2.95098C13.7974 2.57849 13.4876 2.26869 13.1151 2.05352C12.8724 1.91347 12.5564 1.82237 12.0253 1.77423C11.4847 1.72528 10.7888 1.7254 9.80164 1.7254H7.71472C6.7562 1.72558 5.92665 2.27697 5.52332 3.07891H4.07019C4.54221 1.51132 5.9932 0.368186 7.71472 0.367975H9.80164Z"
                fill="currentColor"
              ></path>
            </svg>
          </>
        ),
        label: isCopied ? "已复制" : "复制",
        onClick: handleCopy,
        className: isCopied ? styles.copied : "",
      });

      // 编辑按钮（仅用户消息）
      if (role === "user") {
        buttons.push({
          icon: (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.94076 1.34942C10.7047 0.90231 11.6503 0.902415 12.4143 1.34942C12.7061 1.52015 12.9688 1.79118 13.3104 2.13284C13.6521 2.47448 13.9231 2.73721 14.0939 3.02894C14.5408 3.79294 14.5409 4.73856 14.0939 5.50251C13.9231 5.79415 13.652 6.05704 13.3104 6.39861L6.65932 13.0497C6.28068 13.4284 6.00695 13.7108 5.66543 13.9097C5.32391 14.1085 4.94315 14.2074 4.42705 14.3498L3.24394 14.6761C2.77527 14.8054 2.34538 14.9262 2.00131 14.9684C1.65196 15.0112 1.17964 15.0013 0.810764 14.6325C0.441921 14.2637 0.432107 13.7913 0.47486 13.442C0.517035 13.0979 0.6379 12.668 0.767181 12.1993L1.09352 11.0162C1.23588 10.5001 1.33481 10.1193 1.5336 9.77784C1.7325 9.43632 2.0149 9.1626 2.39355 8.78395L9.04466 2.13284C9.38625 1.79126 9.64911 1.52016 9.94076 1.34942ZM15.5427 14.8398H7.55223L8.96707 13.425H15.5427V14.8398ZM3.39382 9.78422C2.965 10.213 2.84244 10.3436 2.75709 10.49C2.67183 10.6366 2.61862 10.8079 2.45733 11.3925L2.13099 12.5756C2.00183 13.0439 1.92194 13.3419 1.88863 13.5536C2.10041 13.5204 2.39872 13.4416 2.86764 13.3123L4.05075 12.9859C4.63544 12.8246 4.80669 12.7715 4.95323 12.6862C5.09968 12.6008 5.23022 12.4783 5.65905 12.0494L10.721 6.98644L8.45577 4.72121L3.39382 9.78422ZM11.7 2.57079C11.3774 2.38198 10.9777 2.38198 10.6551 2.57079C10.5602 2.62647 10.4487 2.72931 10.0449 3.13311L9.45604 3.72094L11.7213 5.98617L12.3102 5.39833C12.7139 4.99457 12.8168 4.88307 12.8725 4.78818C13.0613 4.46561 13.0612 4.06585 12.8725 3.74326C12.8169 3.64827 12.7146 3.53752 12.3102 3.13311C11.9057 2.72863 11.795 2.6264 11.7 2.57079Z"
                  fill="currentColor"
                ></path>
              </svg>
            </>
          ),
          label: "编辑",
          onClick: handleEdit,
        });
      }

      // 重新生成按钮（仅助手消息，且不在流式输出中）
      if (role === "assistant") {
        buttons.push({
          icon: (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.92136 0.349152C10.3744 0.349234 12.5564 1.5052 13.9557 3.29894L15.1281 2.12759C15.3303 1.92546 15.6767 2.06943 15.6767 2.35538V5.53923C15.6766 5.71626 15.5329 5.85976 15.3559 5.86002H12.171C11.8854 5.8597 11.7426 5.51465 11.9443 5.31249L12.9641 4.29056C11.8237 2.74305 9.98908 1.74106 7.92136 1.74097C4.46436 1.74097 1.66233 4.543 1.66233 8C1.66233 11.457 4.46436 14.259 7.92136 14.259C11.3782 14.2589 14.1804 11.4569 14.1804 8H15.5722C15.5722 12.2251 12.1465 15.6507 7.92136 15.6508C3.69614 15.6508 0.270508 12.2252 0.270508 8C0.270508 3.77478 3.69614 0.349152 7.92136 0.349152Z"
                  fill="currentColor"
                ></path>
              </svg>
            </>
          ),
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

export default ChatMessage;
