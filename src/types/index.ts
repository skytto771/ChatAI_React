export interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: number;
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    model: string;           // 模型标识，如 'gpt-3.5-turbo'
    systemPrompt: string;    // 系统提示词
    userPrompt: string;      // 用户角色描述
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
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'gpt-4': 'GPT-4',
    'gpt-4o': 'GPT-4o',
    'claude-3-opus': 'Claude 3 Opus',
    'claude-3-sonnet': 'Claude 3 Sonnet',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
};

// 可用模型列表
export const AVAILABLE_MODELS = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
];