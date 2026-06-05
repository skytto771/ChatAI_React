import React from 'react';
import { type Theme } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import styles from './index.module.scss';

const themes: { value: Theme; title: string }[] = [
    { value: 'default', title: '深邃紫夜' },
    { value: 'aurora', title: '极光翡翠' },
    { value: 'sunset', title: '日落暖橙' },
    { value: 'frost', title: '冰霜蓝' },
];

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className={styles.themeSwitcher}>
            {themes.map((t) => (
                <div
                    key={t.value}
                    className={`${styles.themeDot} ${theme === t.value ? styles.active : ''}`}
                    data-theme-value={t.value}
                    title={t.title}
                    onClick={() => setTheme(t.value)}
                />
            ))}
        </div>
    );
};

export default ThemeSwitcher;