// src/context/ChatContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useEffect,
} from "react";
import type { Chat, Message } from "@/types";

interface ChatContextType {
    chats: Chat[];
    currentChatId: string | null;
    isProcessing: boolean;
    isTyping: boolean;
    sendMessage: (text: string) => void;
    switchChat: (chatId: string) => void;
    createNewChat: () => void;
    getCurrentMessages: () => Message[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const generateSmartReply = (input: string): string => {
    const lower = input.toLowerCase();
    if (
        lower.includes("你好") ||
        lower.includes("hi") ||
        lower.includes("hello")
    ) {
        return "你好！😊 今天想聊点什么？";
    } else if (lower.includes("主题") || lower.includes("颜色")) {
        return "你可以在左侧边栏底部切换主题颜色～ 试试“极光翡翠”或“日落暖橙”吧！";
    } else if (lower.includes("代码") || lower.includes("bug")) {
        return "🐞 调试建议：检查变量作用域，或者用 <code>console.log</code> 打印关键值。需要具体看看代码吗？";
    } else if (lower.includes("旅行") || lower.includes("旅游")) {
        return "✈️ 推荐小众目的地：云南沙溪、福建霞浦、川西格聂。你喜欢自然风光还是人文历史？";
    } else if (lower.includes("笑话")) {
        return "为什么程序员喜欢暗色主题？因为光太亮会吸引 bug！😄";
    } else {
        const replies = [
        "这很有趣！可以再详细说说吗？",
        "我理解你的意思了。让我想想……",
        "从我的知识库来看，这个问题有几个角度。",
        "✨ 好问题！以下是我的分析：",
        "👀 正在为你检索最佳答案……",
        ];
        return replies[Math.floor(Math.random() * replies.length)];
    }
};

const INITIAL_CHATS: Chat[] = [
    {
        id: "1",
        title: "今天的灵感探讨",
        messages: [
            {
                id: '0',
                role: "ai",
                text: "你好！我是 AI 助手，可以帮你写作、编程、解答问题。<br>试试问我些什么吧 ✨",
                timestamp: Date.now(),
            },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: "2",
        title: "代码调试助手",
        messages: [
            { 
                id: '0',
                role: "ai", 
                text: "👨‍💻 代码调试模式已启动。请描述你遇到的问题。" ,
                timestamp: Date.now(),
            },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: "3",
        title: "周末旅行计划",
        messages: [
            { 
                id: '0',
                role: "ai", 
                text: "🌍 旅行计划助手已就绪！你想去哪里探险？",
                timestamp: Date.now(),
            }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
];

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
    const [currentChatId, setCurrentChatId] = useState<string>("1");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<number>(null);

    const getCurrentMessages = useCallback(() => {
        const chat = chats.find((c) => c.id === currentChatId);
        return chat ? chat.messages : [];
    }, [chats, currentChatId]);

    const updateChatMessages = useCallback(
        (chatId: string, messages: Message[]) => {
            setChats((prev) =>
                prev.map((chat) => (chat.id === chatId ? { ...chat, messages } : chat)),
            );
        },
        [],
    );

    const addMessageToCurrentChat = useCallback(
        (message: Message) => {
            const chat = chats.find((c) => c.id === currentChatId);
            if (chat) {
                const updatedMessages = [...chat.messages, message];
                updateChatMessages(currentChatId, updatedMessages);
            }
        },
        [chats, currentChatId, updateChatMessages],
    );

    const sendMessage = useCallback(
        (text: string) => {
            if (!text.trim() || isProcessing) return;

            // 添加用户消息
            addMessageToCurrentChat({ id:'0',role: "user", text: text.trim(), timestamp: Date.now() });

            // 开始AI回复流程
            setIsProcessing(true);
            setIsTyping(true);

            // 清除之前的定时器
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            typingTimeoutRef.current = setTimeout(
                () => {
                    const reply = generateSmartReply(text);
                    addMessageToCurrentChat({ id: '0', role: "ai", text: reply, timestamp: Date.now() });
                    setIsTyping(false);
                    setIsProcessing(false);
                },
                1000 + Math.random() * 1500,
            );
        },
        [isProcessing, addMessageToCurrentChat],
    );

    const switchChat = useCallback(
        (chatId: string) => {
            if (isProcessing) {
                alert("请等待当前回复完成后再切换对话。");
                return;
            }
            setIsTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setIsProcessing(false);
            setCurrentChatId(chatId);
        },
        [isProcessing],
    );

    const createNewChat = useCallback(() => {
        if (isProcessing) {
            alert("请等待当前回复完成。");
            return;
        }
        const newId = Date.now().toString();
        const newChat: Chat = {
            id: newId,
            title: "新对话",
            messages: [{ id:'0', role: "ai", text: "✨ 新对话已创建！尽管问我任何问题。", timestamp: Date.now() }],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setChats((prev) => [newChat, ...prev]);
        setCurrentChatId(newId);
        setIsTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsProcessing(false);
    }, [isProcessing]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    return (
        <ChatContext.Provider
            value={{
                chats,
                currentChatId,
                isProcessing,
                isTyping,
                sendMessage,
                switchChat,
                createNewChat,
                getCurrentMessages,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within ChatProvider");
    return context;
};
