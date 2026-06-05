import React from 'react';
import styles from './index.module.scss';

interface ChatMessageProps {
    role: 'user' | 'ai';
    text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, text }) => {
    const avatarContent = role === 'ai' ? '🤖' : '👤';

    return (
        <div className={`${styles.message} ${styles[role]}`}>
            <div className={styles.avatar}>{avatarContent}</div>
            <div className={styles.bubble} dangerouslySetInnerHTML={{ __html: text }} />
        </div>
    );
};

export default ChatMessage;