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
    createdAt: number;
    updatedAt: number;
}

export type Theme = 'default' | 'aurora' | 'sunset' | 'frost';

export interface ChatState {
    chats: Chat[];
    activeChatId: string;
    isResponding: boolean;
}