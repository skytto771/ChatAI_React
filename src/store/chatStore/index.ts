import { create } from 'zustand';
import type { Chat, Message, ChatState } from '@/types';

// 辅助函数生成ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 初始示例数据
const getInitialChats = (defaultModel: string): Chat[] => {
    const now = Date.now();
    return [
        {
            id: '1',
            title: '今天的灵感探讨',
            messages: [
                {
                    id: generateId(),
                    role: 'ai',
                    text: '你好！我是 AI 助手，可以帮你写作、编程、解答问题。<br>试试问我些什么吧 ✨',
                    timestamp: now,
                },
            ],
            model: defaultModel,
            systemPrompt: '',
            userPrompt: '',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: '2',
            title: '代码调试助手',
            messages: [
                {
                    id: generateId(),
                    role: 'ai',
                    text: '👨‍💻 代码调试模式已启动。',
                    timestamp: now,
                },
            ],
            model: 'gpt-4',
            systemPrompt: '你是一个资深软件工程师。',
            userPrompt: '',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: '3',
            title: '周末旅行计划',
            messages: [
                {
                    id: generateId(),
                    role: 'ai',
                    text: '🌍 旅行计划助手已就绪！',
                    timestamp: now,
                },
            ],
            model: 'claude-3-sonnet',
            systemPrompt: '你是一个热情洋溢的旅行顾问。',
            userPrompt: '',
            createdAt: now,
            updatedAt: now,
        },
    ];
};

interface ChatStore extends ChatState {
    loadChats: (defaultModel: string) => void;
    addMessage: (chatId: string, role: 'user' | 'ai', text: string) => void;
    createNewChat: (title: string, model: string, systemPrompt: string, userPrompt: string) => string;
    updateChatTitle: (chatId: string, title: string) => void;
    updateChatModel: (chatId: string, model: string) => void;
    updateChatSystemPrompt: (chatId: string, systemPrompt: string) => void;
    updateChatUserPrompt: (chatId: string, userPrompt: string) => void;
    setActiveChatId: (id: string) => void;
    setIsResponding: (isResponding: boolean) => void;
    deleteChat: (chatId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    chats: [],
    activeChatId: '',
    isResponding: false,

    loadChats: (defaultModel: string) => {
        const saved = localStorage.getItem('ai-chats');
        if (saved) {
            try {
                const chats = JSON.parse(saved);
                set({ chats, activeChatId: chats[0]?.id || '' });
                return;
            } catch (e) { /* ignore */ }
        }
        const chats = getInitialChats(defaultModel);
        set({ chats, activeChatId: chats[0]?.id || '' });
    },

    addMessage: (chatId, role, text) => {
        const newMessage: Message = {
            id: generateId(),
            role,
            text,
            timestamp: Date.now(),
        };
        set((state) => {
            const updatedChats = state.chats.map(chat =>
                chat.id === chatId
                    ? {
                        ...chat,
                        messages: [...chat.messages, newMessage],
                        updatedAt: Date.now(),
                    }
                    : chat
            );
            localStorage.setItem('ai-chats', JSON.stringify(updatedChats));
            return { chats: updatedChats };
        });
    },

    createNewChat: (title, model, systemPrompt, userPrompt) => {
        const now = Date.now();
        const newId = generateId();
        const newChat: Chat = {
            id: newId,
            title: title || '新对话',
            messages: [],
            model,
            systemPrompt,
            userPrompt,
            createdAt: now,
            updatedAt: now,
        };
        set((state) => {
            const newChats = [newChat, ...state.chats];
            localStorage.setItem('ai-chats', JSON.stringify(newChats));
            return { chats: newChats, activeChatId: newId };
        });
        return newId;
    },

    updateChatTitle: (chatId, title) => {
        set((state) => {
            const updatedChats = state.chats.map(chat =>
                chat.id === chatId ? { ...chat, title, updatedAt: Date.now() } : chat
            );
            localStorage.setItem('ai-chats', JSON.stringify(updatedChats));
            return { chats: updatedChats };
        });
    },

    updateChatModel: (chatId, model) => {
        set((state) => {
            const updatedChats = state.chats.map(chat =>
                chat.id === chatId ? { ...chat, model, updatedAt: Date.now() } : chat
            );
            localStorage.setItem('ai-chats', JSON.stringify(updatedChats));
            return { chats: updatedChats };
        });
    },

    updateChatSystemPrompt: (chatId, systemPrompt) => {
        set((state) => {
            const updatedChats = state.chats.map(chat =>
                chat.id === chatId ? { ...chat, systemPrompt, updatedAt: Date.now() } : chat
            );
            localStorage.setItem('ai-chats', JSON.stringify(updatedChats));
            return { chats: updatedChats };
        });
    },

    updateChatUserPrompt: (chatId, userPrompt) => {
        set((state) => {
            const updatedChats = state.chats.map(chat =>
                chat.id === chatId ? { ...chat, userPrompt, updatedAt: Date.now() } : chat
            );
            localStorage.setItem('ai-chats', JSON.stringify(updatedChats));
            return { chats: updatedChats };
        });
    },

    setActiveChatId: (id) => set({ activeChatId: id }),

    setIsResponding: (isResponding) => set({ isResponding }),

    deleteChat: (chatId) => {
        set((state) => {
            const newChats = state.chats.filter(c => c.id !== chatId);
            const newActiveId = newChats.length > 0 ? newChats[0].id : '';
            localStorage.setItem('ai-chats', JSON.stringify(newChats));
            return { chats: newChats, activeChatId: newActiveId };
        });
    },
}));