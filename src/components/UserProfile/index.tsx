import React, { useState, useRef, useEffect } from 'react';
import styles from './index.module.scss';
import { useUserStore } from '@/store';

interface UserProfileProps {
    onOpenSettings: () => void;
    onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onOpenSettings, onLogout }) => {
    const userStore = useUserStore()
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const togglePopup = () => setIsExpanded(prev => !prev);
    const closePopup = () => setIsExpanded(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closePopup();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className={styles.userProfileContainer} ref={containerRef}>
            <div className={`${styles.userProfile} ${isExpanded ? styles.expanded : ''}`} onClick={togglePopup}>
                {userStore.user.avatarUrl ? <div className={styles.userAvatar}>
                    <img src='' alt="" />
                </div>
                :<div className={styles.userAvatar}>🧑‍🚀</div>}
                <div className={styles.userInfoText}>
                    <span className={styles.userName}>{userStore.user.nickname || userStore.user.username}</span>
                    <span className={styles.userStatus}>
                        <span className={styles.statusDot}></span>在线
                    </span>
                </div>
                <span className={styles.userArrow}>▾</span>
            </div>
            <div className={`${styles.popupMenu} ${isExpanded ? styles.visible : ''}`}>
                <button className={styles.popupMenuItem} onClick={()=>{
                    closePopup()
                    onOpenSettings()
                }}>
                    <span className={styles.menuIcon}>⚙️</span> 系统设置
                </button>
                <button className={`${styles.popupMenuItem} ${styles.danger}`} onClick={onLogout}>
                    <span className={styles.menuIcon}>🚪</span> 登出
                </button>
            </div>
        </div>
    );
};

export default UserProfile;