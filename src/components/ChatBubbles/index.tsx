import styles from './index.module.scss';

const ChatBubbles = () => (
    <div className={styles.bubbles}>
        <div className={`${styles.bubble} ${styles.aiBubble}`}>
            你好！我是 AI 助手 🤖<br />准备好开始对话了吗？
        </div>
        <div className={`${styles.bubble} ${styles.userBubble}`}>
            当然！让我先登录账号～
        </div>
        <div className={`${styles.bubble} ${styles.aiBubble}`}>
            <span className={styles.dotTyping}>
                <span /><span /><span />
            </span>
            <span style={{ marginLeft: 6 }}>正在等待验证...</span>
        </div>
    </div>
);

export default ChatBubbles;