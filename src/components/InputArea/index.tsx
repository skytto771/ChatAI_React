import React, { useState, useRef, useEffect, type KeyboardEvent } from "react";
import type { chatSettings, Chat } from "@/types";
import styles from "./index.module.scss";

interface updateSettings extends chatSettings {
  conversationId: string;
}

interface InputAreaProps {
  onUpdateSetting: (settings: updateSettings) => Promise<string>;
  onSend: (message: string) => void;
  disabled: boolean;
  chat: Chat | null;
}

const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  disabled,
  chat,
  onUpdateSetting,
}) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSend = () => {
    const text = inputValue.trim();
    if (text === "" || disabled) return;
    onSend(text);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  // function disableF(){
  //     if(!chat) return
  //     if(chat.model.includes('deepseek')){
  //         return true
  //     }
  // }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, []);

  return (
    <div className={styles.inputArea}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          placeholder="输入消息... (Enter 发送)"
          disabled={disabled}
        />
        <div className={styles.sendBtnWrapper}>
          {chat && (
            <div className={styles.sections}>
              {chat.settings && (
                <>
                  {/* {!disableF()&&<div>深度思考</div>} */}
                  {/* {!disableF()&&<div>联网搜索</div>} */}
                  <div
                    className={`${chat.settings.isThinking && styles.active}`}
                    onClick={() =>
                      onUpdateSetting({
                        conversationId: chat.id,
                        isThinking: !chat.settings.isThinking,
                      })
                    }
                  >
                    深度思考
                  </div>
                </>
              )}
            </div>
          )}
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={disabled}
            title="发送消息"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
