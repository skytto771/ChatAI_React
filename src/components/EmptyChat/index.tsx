import React, { useState } from "react";
import styles from "./index.module.scss";
import { AVAILABLE_MODELS, type chatSettings } from "@/types";

interface EmptyChatPlaceholderProps {
  onStartChat: (config: chatSettings) => Promise<void>;
}

const EmptyChatPlaceholder: React.FC<EmptyChatPlaceholderProps> = ({
  onStartChat,
}) => {
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].value);
  const [isThinking] = useState(false);

  const handleStart = () => {
    onStartChat({ model: selectedModel, isThinking });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>新对话</div>
        <div className={styles.subtitle}>选择模型与思考模式，开启智能交流</div>

        <div className={styles.config}>
          <div className={styles.field}>
            <label className={styles.label}>模型</label>
            <select
              className={styles.select}
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* <div className={styles.field}>
                    <label className={styles.label}>深度思考</label>
                    <div
                    className={styles.toggleWrapper}
                    onClick={() => setIsThinking(!isThinking)}
                    >
                        <input
                            type="checkbox"
                            className={styles.toggleInput}
                            checked={isThinking}
                            onChange={() => {}}
                        />
                        <span
                            className={`${styles.toggleSlider} ${
                            isThinking ? styles.active : ''
                            }`}
                        />
                        <span className={styles.toggleLabel}>
                            {isThinking ? '开启' : '关闭'}
                        </span>
                    </div>
                </div> */}
        </div>

        <button className={styles.startBtn} onClick={handleStart}>
          <span>💬</span> 开始对话
        </button>
      </div>
    </div>
  );
};

export default EmptyChatPlaceholder;
