// pages/ChatPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import MessageBubble, { type Message } from '../../components/MessageBubble';
import ThemeToggle from '../../components/ThemeToggle';
import styles from './index.module.scss';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 AI 助手，有什么可以帮你的吗？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 模拟 AI 回复
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `收到你的消息："${input}"。这是一个模拟回复。`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>AI Chat</h2>
        <ThemeToggle />
      </div>
      <div className={styles.chatContainer}>
        <div className={styles.messageList}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className={styles.typing}>
              <div className={styles.avatar}>🤖</div>
              <div className={styles.typingBubble}>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="输入消息..."
              rows={2}
            />
            <button onClick={handleSend} className="btn btn-primary">
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;