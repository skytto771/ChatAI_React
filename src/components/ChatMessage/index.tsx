import React, { useState } from 'react';
import styles from './index.module.scss';
import '@/assets/styles/markdown.scss'
interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system';
    reasoning?: string;
    text: string;
    isResponse: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, text, reasoning,isResponse }) => {
    const avatarContent = role === 'assistant' ? '🤖' : '👤';

    return (
        <div className={`${styles.message} ${styles[role]}`}>
            <div className={styles.avatar}>{avatarContent}</div>
            {
                role === 'assistant' ? (
                    <div className={`${styles.bubble}`}>
                        {reasoning&&isResponse&&<p className={`${styles.thinkingMessage} `}>
                            {reasoning}
                        </p>}
                        <div className={`md-body`} dangerouslySetInnerHTML={{ __html: text }} />
                    </div>
                ) : (
                    <div className={`${styles.bubble} ${styles.messageText}`}>{text}</div>
                )
            }
        </div>
    );
};

export default ChatMessage;