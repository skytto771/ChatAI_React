export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    reasoning: string;
    tokensUsed: number;
}

export interface User {
    id: string;
    username: string;
    avatarUrl?: string;
    role: string;
    email: string;
    phone?: string;
    nickname?: string;
    bio?: string;
    status: string;
    lastLoginAt: Date;
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    model: string;           // 模型标识，如 'gpt-3.5-turbo'
    createdAt: number;
    updatedAt: number;
}

export type Theme = 'default' | 'aurora' | 'sunset' | 'frost';

export interface UserSettings {
    nickname: string;
    soundEnabled: boolean;
    autoScroll: boolean;
    defaultModel: string;
    defaultSystemPrompt: string;
    defaultUserPrompt: string;
}

export interface ChatState {
    chats: Chat[];
    activeChatId: string;
    isResponding: boolean;
}

// 模型展示名称映射
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
    'deepseek-v4-flash': 'deepseek-v4-flash',
    'deepseek-v4-pro': 'deepseek-v4-flash',
};

// 可用模型列表
export const AVAILABLE_MODELS = [
    { value: 'deepseek-v4-flash', label: 'deepseek-v4-flash' },
    { value: 'deepseek-v4-pro', label: 'deepseek-v4-pro' },
];