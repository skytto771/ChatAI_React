export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    reasoning: string;
    tokensUsed: number;
    status: 'completed' | 'generating';
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
    settings: chatSettings;
    model: string;           // 模型标识，如 'gpt-3.5-turbo'
    createdAt: number;
    updatedAt: number;
}

export type Theme = 'default' | 'aurora' | 'sunset' | 'frost';

export interface chatSettings{
    model?: string;
    title?: string;
    systemPrompt?: string;
    userPrompt?: string;

    // 上下文配置
    contextLimit?: number;
    maxTokens?: number;
    
    // 思考模式配置
    isThinking?: boolean;
    thinkingMode?: "fast" | "balanced" | "deep";
    
    // 功能开关
    enableWebSearch?: boolean;
    enableCodeInterpreter?: boolean;
    enableFileUpload?: boolean;
    
    // 模型参数
    temperature?: number;
    topP?: number;
    logprobs?: boolean;
    topLogprobs?: number;
    
    // 响应配置
    responseFormat?: "text" | "json" | "markdown";
    streamResponse?: boolean;
    
    // 安全配置
    contentFilter?: "strict" | "moderate" | "loose";
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