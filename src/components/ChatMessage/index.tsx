import React from 'react';
import styles from './index.module.scss';
import '@/assets/styles/markdown.scss'
interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system';
    text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, text }) => {
    const avatarContent = role === 'assistant' ? '🤖' : '👤';

    return (
        <div className={`${styles.message} ${styles[role]}`}>
            <div className={styles.avatar}>{avatarContent}</div>
            {
                role === 'assistant' ? (
                    <div className={`${styles.bubble} md-body`} dangerouslySetInnerHTML={{ __html: text }} />
                ) : (
                    <div className={`${styles.bubble} ${styles.messageText}`}>{text}</div>
                )
            }
        </div>
    );
};

export default ChatMessage;