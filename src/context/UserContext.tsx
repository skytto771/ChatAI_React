import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type UserSettings } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserContextType {
    settings: UserSettings;
    updateNickname: (nickname: string) => void;
    updateSoundEnabled: (enabled: boolean) => void;
    updateAutoScroll: (enabled: boolean) => void;
    updateDefaultModel: (model: string) => void;
    updateDefaultSystemPrompt: (prompt: string) => void;
    updateDefaultUserPrompt: (prompt: string) => void;
}

const defaultSettings: UserSettings = {
    nickname: '探索者',
    soundEnabled: true,
    autoScroll: true,
    defaultModel: 'gpt-3.5-turbo',
    defaultSystemPrompt: '',
    defaultUserPrompt: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [settings, setSettings] = useLocalStorage<UserSettings>('ai-user-settings', defaultSettings);

    const updateNickname = (nickname: string) => {
        setSettings(prev => ({ ...prev, nickname: nickname || '探索者' }));
    };
    const updateSoundEnabled = (soundEnabled: boolean) => {
        setSettings(prev => ({ ...prev, soundEnabled }));
    };
    const updateAutoScroll = (autoScroll: boolean) => {
        setSettings(prev => ({ ...prev, autoScroll }));
    };
    const updateDefaultModel = (defaultModel: string) => {
        setSettings(prev => ({ ...prev, defaultModel }));
    };
    const updateDefaultSystemPrompt = (defaultSystemPrompt: string) => {
        setSettings(prev => ({ ...prev, defaultSystemPrompt }));
    };
    const updateDefaultUserPrompt = (defaultUserPrompt: string) => {
        setSettings(prev => ({ ...prev, defaultUserPrompt }));
    };

    return (
        <UserContext.Provider
            value={{
                settings,
                updateNickname,
                updateSoundEnabled,
                updateAutoScroll,
                updateDefaultModel,
                updateDefaultSystemPrompt,
                updateDefaultUserPrompt,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};