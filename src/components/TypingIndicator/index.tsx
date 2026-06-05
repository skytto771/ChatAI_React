import React from 'react';
import styles from './index.module.scss';

const TypingIndicator: React.FC = () => {
    return (
        <div className={styles.typingIndicator}>
            <span></span>
            <span></span>
            <span></span>
        </div>
    );
};

export default TypingIndicator;