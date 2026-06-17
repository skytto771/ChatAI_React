// MessageNav.tsx
import { useEffect, useRef } from 'react';
import styles from './MessageNav.module.scss';

interface MessageNavProps {
    onSelect: (id: string) => void;
    messages: any[];
}

const MessageNav: React.FC<MessageNavProps> = ({ onSelect, messages }) => {
    const userMessages = messages.filter((msg) => msg.role === 'user');
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => { 
        const nav = navRef.current;
        if(!nav) return
        nav.addEventListener('mouseenter', () => {
            console.log('mouseenter')
            nav.classList.add(styles.active);
        });
        nav.addEventListener('mouseleave', () => {
            console.log('mouseleave')
            nav.classList.remove(styles.active);
        });
        return ()=>{
            nav.removeEventListener('mouseenter', ()=>{});
            nav.removeEventListener('mouseleave', ()=>{});
        }
    }, [messages]);

    return (
        <div className={styles.msgNav} ref={navRef}>
            {/* 收缩时显示的把手，悬停后列表滑出 */}
            <ul className={styles.msgNavList}>
                {userMessages.map((msg) => (
                    <li
                        key={msg.id}
                        className={styles.msgNavItem}
                        onClick={() => onSelect(msg.id)}
                        title={msg.content.slice(0, 20)}
                    >
                        <span> - </span>{msg.content.slice(0, 20)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MessageNav;