import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { type Theme } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useLocalStorage<Theme>('ai-chat-theme', 'default');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme === 'default' ? '' : theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};