import { create } from "zustand";
import type { ChatState, Message, chatSettings } from "@/types";
import { devtools } from "zustand/middleware";
import { http, marked } from "@/utils";
import api from "@/api";
import { httpStream } from "@/utils/httpUtil";

interface updateSettings extends chatSettings { 
    conversationId: string;
}

interface ChatStore extends ChatState {
  settings: chatSettings;
  loadChats: () => Promise<void>;
  loadCurMessages: (
    chatId: string,
  ) => Promise<{ status: "generating" | "completed"; messageId?: string }>;
  addMessage: (
    chatId: string,
    role: "user" | "assistant",
    text: string,
    tokensUsed?: number,
  ) => Promise<void>;
  generateAiReply: (chatId: string, readFn: void) => Promise<void>;
  resume: (chatId: string, messageId: string) => Promise<void>;
  createNewChat: (config: chatSettings) => Promise<string>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  setActiveChatId: (id: string) => void;
  setIsResponding: (isResponding: boolean) => void;
  deleteChat: (chatId: string) => Promise<void>;
  getChatModelSettings: (chatId: string) => Promise<chatSettings>;
  updateChatModelSettings: (config:updateSettings)=>Promise<string>;
  updateUserModelSettings: (settings: chatSettings) => Promise<void>;
  loadModelSettings: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChatId: "",
  isResponding: false,
  settings: {},

  loadChats: async () => {
    return new Promise(async (resolve, reject) => {
      const actConversationId =
        localStorage.getItem("activeConversationId") || "";
      let hasId = false;

      try {
        const res = await http.post(api.conversation.getConversationList, {});
        const resd = res.data;
        const chats = resd.rows.map((c: any) => {
          if (c.id === actConversationId) {
            hasId = true;
          }
          return c;
        });
        set({ chats, activeChatId: hasId ? actConversationId : "" });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  loadCurMessages: async (chatId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await http.post(api.message.getMessageList, {
          conversationId: chatId,
        });
        const resD = res.data;
        set((state) => {
          let isGenerating = false;
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              chat.messages = resD.rows.map((message: any) => {
                let origenalContent = "";
                if (message.role === "assistant") {
                  origenalContent = message.content;
                  message.content = marked.parse(message.content, {
                    async: false,
                  });
                }
                if (message.status === "generating") {
                  isGenerating = true;
                  resolve({ status: "generating", messageId: message.id });
                }
                return message;
              });
            }
            return chat;
          });
          if (!isGenerating) {
            resolve({ status: "completed" });
          }
          return { chats: updatedChats };
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  addMessage: async (chatId, role, content, tokensUsed) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await http.post(api.message.addMessage, {
          conversationId: chatId,
          role,
          content,
          tokensUsed,
        });
        const resD = res.data;
        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              if (chat.messages.length == 0) {
                chat.title = resD.content.substring(0, 10);
              }
              chat.messages.push(resD);
            }
            return chat;
          });
          return { chats: updatedChats };
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  generateAiReply: async (chatId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await httpStream.post(api.message.generateAiReply, {
          conversationId: chatId,
        });
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let contentBuffer = "";
        let contentMd = "";
        let reasoningBuffer = "";
        let parseSchedule = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            resolve();
            break;
          }

          const chunkMsg = decoder.decode(value);
          const messagesJSON = chunkMsg
            .split("\n\n")
            .filter((chunk) => chunk.trim() !== "");

          messagesJSON.forEach((chunk) => {
            const messageChunk = JSON.parse(chunk);
            if (messageChunk.type === "reasoning_content") {
              reasoningBuffer += messageChunk.content;
              setMessage(
                messageChunk.messageId,
                messageChunk.type,
                reasoningBuffer,
              );
            } else {
              contentBuffer += messageChunk.content;
              contentMd = contentMd + messageChunk.content;
              if (!parseSchedule) {
                parseSchedule = true;
                setTimeout(() => {
                  contentMd = marked.parse(contentBuffer, { async: false });
                  parseSchedule = false;
                }, 500);
              }
              setMessage(messageChunk.messageId, messageChunk.type, contentMd);
            }
          });
        }
        function setMessage(id: string, type: string, displayContent: string) {
          set((state) => {
            const chats = state.chats.map((c) => {
              if (c.id === chatId) {
                const message = c.messages.find((m) => m.id === id);
                if (message) {
                  switch (type) {
                    case "reasoning_content":
                      message.reasoning = displayContent;
                      break;
                    case "content":
                      message.content = displayContent;
                      break;
                    case "finished":
                      message.status = "completed";
                      break;
                  }
                } else {
                  c.messages.push({
                    role: "assistant",
                    content: type === "content" ? contentMd : "",
                    reasoning:
                      type === "reasoning_content" ? reasoningBuffer : "",
                    id: id,
                    tokensUsed: 0,
                    status: "generating",
                  });
                }
              }
              return c;
            });
            return { chats };
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  resume: async (chatId, messageId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await httpStream.post(api.message.resumeReply, {
          messageId,
        });
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let contentBuffer = "";
        let contentMd = "";
        let reasoningBuffer = "";
        let parseSchedule = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            resolve();
            break;
          }
          const chunkMsg = decoder.decode(value);
          const messagesJSON = chunkMsg.split("\n\n");

          messagesJSON.forEach((chunk) => {
            const messageChunk = JSON.parse(chunk);
            if (messageChunk.type === "reasoning_content") {
              reasoningBuffer += messageChunk.content;
              setMessage(
                messageChunk.messageId,
                messageChunk.type,
                reasoningBuffer,
              );
            } else {
              contentBuffer += messageChunk.content;
              contentMd = contentMd + messageChunk.content;
              if (!parseSchedule) {
                parseSchedule = true;
                setTimeout(() => {
                  contentMd = marked.parse(contentBuffer, { async: false });
                  parseSchedule = false;
                }, 500);
              }
              setMessage(messageChunk.messageId, messageChunk.type, contentMd);
            }
          });
        }
        function setMessage(id: string, type: string, displayContent: string) {
          set((state) => {
            const chats = state.chats.map((c) => {
              if (c.id === chatId) {
                const message = c.messages.find((m) => m.id === id);
                if (message) {
                  switch (type) {
                    case "reasoning_content":
                      message.reasoning = displayContent;
                      break;
                    case "content":
                      message.content = displayContent;
                      break;
                    case "finished":
                      message.status = "completed";
                      break;
                  }
                } else {
                  c.messages.push({
                    role: "assistant",
                    content: type === "content" ? contentMd : "",
                    reasoning:
                      type === "reasoning_content" ? reasoningBuffer : "",
                    id: id,
                    tokensUsed: 0,
                    status: "generating",
                  });
                }
              }
              return c;
            });
            return { chats };
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },

    createNewChat: ({ title, model }) => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await http.post(api.conversation.addConversation, {
                title,
                model,
                });
                const resD = res.data;
                set((state) => {
                const newChats = [resD, ...state.chats];
                return { chats: newChats, activeChatId: resD.id };
                });
                resolve(resD.id);
            } catch (err) {
                reject(err);
            }
        });
    },

    updateChatTitle: async (chatId, title) => {
        return new Promise(async (resolve, reject) => {
            try {
                await http.post(api.conversation.updateConversation, {
                    id: chatId,
                    title,
                });
                set((state) => {
                    const updatedChats = state.chats.map((chat) =>
                        chat.id === chatId
                        ? { ...chat, title, updatedAt: Date.now() }
                        : chat,
                    );
                    return { chats: updatedChats };
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    },

    setActiveChatId: (id) => {
        localStorage.setItem("activeConversationId", id);
        set({ activeChatId: id });
    },

    setIsResponding: (isResponding) => set({ isResponding }),

    deleteChat: async (chatId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await http.post(api.conversation.delConversation, { id: chatId });
                set((state) => {
                    const newChats = state.chats.filter((c) => c.id !== chatId);
                    const newActiveId = newChats.length > 0 ? newChats[0].id : "";
                    localStorage.setItem("ai-chats", JSON.stringify(newChats));
                    return { chats: newChats, activeChatId: newActiveId };
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    },
    getChatModelSettings: async (chatId) => { 
        return new Promise(async (resolve, reject)=>{
            const res = await http.post(api.modelSettings.getConversationSettings, { conversationId: chatId })
            const resD = res.data
            if(resD.thinkingMode !== 'fast'){
                resD.isThinking = true
            }else{
                resD.isThinking = false
            }
            set(state=>{
                state.chats.forEach(chat=>{
                    if(chat.id === chatId){
                        resD.title = chat.title
                        resD.model = chat.model
                    }
                    return chat
                })
                return { }
            })

            resolve(resD)
        })
    },
    updateChatModelSettings: async (updates) => { 
        return new Promise(async (resolve, reject)=>{
            const res = await http.post(api.modelSettings.updateConversationSettings, updates)
            resolve('更新成功')
        })
    },

    updateUserModelSettings: async (updates) => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await http.post(api.modelSettings.updateSettings, updates);
                const settings = res.data;
                set({ settings });
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    },
    loadModelSettings: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await http.post(api.modelSettings.getSettings, {});
                const settings = res.data;
                set({ settings });
            } catch (err) {
                reject(err);
            }
        });
    },
}));
