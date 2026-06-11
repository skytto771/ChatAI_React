import { create } from 'zustand';
import type { Chat, ChatState, Message } from '@/types';
import { devtools } from 'zustand/middleware';
import { http, marked } from '@/utils';
import api from '@/api';
import { httpStream } from '@/utils/httpUtil';

interface chatSettings{
    // 上下文配置
    contextLimit?: number;
    maxTokens?: number;
    
    // 思考模式配置
    thinkingMode?: "fast" | "balanced" | "deep";
    
    // 功能开关
    enableWebSearch?: boolean;
    enableCodeInterpreter?: boolean;
    enableFileUpload?: boolean;
    
    // 模型参数
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    
    // 响应配置
    responseFormat?: "text" | "json" | "markdown";
    streamResponse?: boolean;
    
    // 安全配置
    contentFilter?: "strict" | "moderate" | "loose";
}

interface ChatStore extends ChatState {
    settings: chatSettings;
    loadChats: () => Promise<void>;
    loadCurMessages: (chatId: string) => Promise<void>;
    addMessage: (chatId: string, role: 'user' | 'assistant', text: string, tokensUsed?:number) => Promise<void>;
    generateAiReply: (chatId: string, readFn: void) => Promise<void>;
    createNewChat: (title: string, model: string, systemPrompt: string, userPrompt: string) => Promise<void>;
    updateChatTitle: (chatId: string, title: string) => Promise<void>;
    updateChatModel: (chatId: string, model: string) => void;
    updateChatSystemPrompt: (chatId: string, systemPrompt: string) => void;
    updateChatUserPrompt: (chatId: string, userPrompt: string) => void;
    setActiveChatId: (id: string) => void;
    setIsResponding: (isResponding: boolean) => void;
    deleteChat: (chatId: string) => Promise<void>;
    updateModelSettings: (settings: chatSettings) => Promise<void>;
    loadModelSettings: ()=>Promise<void>,
}

export const useChatStore = create<ChatStore>(
    (set, get) => ({
        chats: [],
        activeChatId: '',
        isResponding: false,
        settings: {},

        loadChats: async () => {
            return new Promise(async (resolve, reject) => { 
                const actConversation = localStorage.getItem('activeConversationId')

                try{
                    const res = await http.post(api.conversation.getConversationList,{})
                    const resd = res.data
                    const chats = resd.rows
                    set({ chats, activeChatId: actConversation || chats[0]?.id  });
                    resolve()
                }catch(err){
                    reject(err)
                }
            });
        },

        loadCurMessages: async (chatId) => { 
            return new Promise(async (resolve, reject) => { 
                try{
                    const res = await http.post(api.message.getMessageList,{conversationId:chatId})
                    const resD = res.data
                    set(((state)=>{
                        const updatedChats = state.chats.map(chat=>{
                            if(chat.id === chatId){
                                chat.messages = resD.rows.map((message:any)=>{
                                    if(message.role === 'assistant'){
                                        message.content = marked.parse(message.content)
                                    }
                                    return message
                                })
                            }
                            return chat
                        })
                        return {chats:updatedChats}
                    }))
                    resolve()
                }catch(err){
                    reject(err)
                }
            })
        },

        addMessage: async (chatId, role, content, tokensUsed) => {
            return new Promise(async (resolve,reject)=>{
                try{
                    const res = await http.post(api.message.addMessage,{
                        conversationId: chatId,
                        role,
                        content,
                        tokensUsed
                    })
                    const resD = res.data
                    set((state) => {
                        const updatedChats = state.chats.map(chat =>{
                            if(chat.id === chatId){
                                if(chat.messages.length == 0){
                                    chat.title = resD.content.substring(0, 10)
                                }
                                chat.messages.push(resD)
                            }
                            return chat
                        });
                        return { chats: updatedChats };
                    });
                    resolve()
                }catch(err){reject(err)}
            })
        },

        generateAiReply: async (chatId)=>{
            return new Promise(async (resolve, reject)=>{
                try{
                    const res = await httpStream.post(api.message.generateAiReply, {
                        conversationId:chatId
                    })
                    const reader = res.body!.getReader();
                    const decoder = new TextDecoder();
                    let contentBuffer = '';
                    let reasoningBuffer = '';
                    while (true) { 
                        const { done, value } = await reader.read();
                        if (done) {
                            resolve();
                            break;
                        }
                        const chunkMsg = decoder.decode(value);
                        const messagesJSON = chunkMsg.split('\n\n').filter(chunk => chunk.trim() !== '');
                        messagesJSON.forEach(chunk => {
                            const messageChunk = JSON.parse(chunk)
                            if(messageChunk.type === 'reasoning_content'){
                                setMessage(messageChunk.messageId,messageChunk.type)
                            }else{
                                contentBuffer += messageChunk.content
                                setMessage(messageChunk.messageId,messageChunk.type)
                            }
                        });
                    }
                    function setMessage(id:string,type:string){
                        set((state)=>{
                            const chats = state.chats.map(c=>{
                                if(c.id===chatId){
                                    const message = c.messages.find(m=>m.id === id)
                                    if(message){
                                        if(type === 'reasoning_content'){
                                            message.reasoning = reasoningBuffer
                                        }else{
                                            message.content = marked.parse(contentBuffer,{async: false})
                                        }
                                    }else{
                                        if(type === 'reasoning_content'){
                                            c.messages.push({
                                                role: 'assistant',
                                                content: '',
                                                reasoning: reasoningBuffer,
                                                id: id,
                                                tokensUsed: 0,
                                            })
                                        }else{
                                            c.messages.push({
                                                role: 'assistant',
                                                content: marked.parse(contentBuffer,{async: false}),
                                                reasoning: '',
                                                id: id,
                                                tokensUsed: 0,
                                            })
                                        }
                                    }
                                }
                                return c
                            })
                            return {chats}
                        })
                    }
                    
                }catch(err){reject(err)}
            })
        },

        createNewChat: (title, model, systemPrompt, userPrompt) => {
            return new Promise(async(resolve,reject)=> { 
                try{
                    const res = await http.post(api.conversation.addConversation, { title, model, systemPrompt, userPrompt })
                    const resD = res.data
                    set((state) => {
                        const newChats = [resD, ...state.chats];
                        localStorage.setItem('ai-chats', JSON.stringify(newChats));
                        return { chats: newChats, activeChatId: resD.id };
                    });
                    resolve();
                }catch(err){
                    reject(err);
                }
            });
        },

        updateChatTitle: async (chatId, title) => {
            return new Promise(async (resolve, reject) => { 
                try{
                    await http.post(api.conversation.updateConversation, { id: chatId, title })
                    set((state) => {
                        const updatedChats = state.chats.map(chat =>
                            chat.id === chatId ? { ...chat, title, updatedAt: Date.now() } : chat
                        );
                        return { chats: updatedChats };
                    });
                    resolve()
                }catch(err){reject(err)}
            });
        },
        updateChatModel: (chatId, model) => {
            set((state) => {
                const updatedChats = state.chats.map(chat =>
                    chat.id === chatId ? { ...chat, model, updatedAt: Date.now() } : chat
                );
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

        setActiveChatId: (id) => {
            localStorage.setItem('activeConversationId', id);
            set({ activeChatId: id })
        },

        setIsResponding: (isResponding) => set({ isResponding }),

        deleteChat: async (chatId) => {
            return new Promise(async (resolve, reject) => { 
                try{
                    await http.post(api.conversation.delConversation, { id: chatId })
                    set((state) => {
                        const newChats = state.chats.filter(c => c.id !== chatId);
                        const newActiveId = newChats.length > 0 ? newChats[0].id : '';
                        localStorage.setItem('ai-chats', JSON.stringify(newChats));
                        return { chats: newChats, activeChatId: newActiveId };
                    });
                    resolve()
                }catch(err){reject(err)}
            });
        },

        updateModelSettings: async (updates) =>{
            return new Promise(async (resolve, reject) => {
                try{
                    const res = await http.post(api.modelSettings.updateSettings, updates)
                    const settings = res.data
                    set({ settings })
                    resolve()
                }catch(err){reject(err)}
            })
        },
        loadModelSettings: async ()=>{
            return new Promise(async (resolve, reject)=>{
                try{
                    const res = await http.post(api.modelSettings.getSettings,{})
                    const settings = res.data
                    set({ settings })
                }catch(err){reject(err)}
            })
        },
    })
);