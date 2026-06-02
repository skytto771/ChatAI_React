import { useEffect } from 'react';
import ParticlesBackground from '../../components/ParticlesBackground';
import ChatBubbles from '../../components/ChatBubbles';
import LoginCard from '../../components/LoginCard';
import styles from './index.module.scss';

function LoginPage() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            // 可以触发表单提交，但这里不做全局处理，让表单自己监听
        }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className={styles.app}>
            <div className="bg-orb orb-1" />
            <div className="bg-orb orb-2" />
            <div className="bg-orb orb-3" />
            <div className="grid-overlay" />
            <ParticlesBackground />
            <div className={styles.mainContainer}>
                <ChatBubbles />
                <LoginCard />
            </div>
        </div>
    );
}

export default LoginPage;