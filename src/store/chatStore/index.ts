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
  generateAiReply: (chatId: string) => Promise<void>;
  resume: (chatId: string, messageId: string) => Promise<void>;
  reGenerateReply: (chatId: string, messageId: string) => Promise<void>;
  createNewChat: (config: chatSettings) => Promise<string>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  setActiveChatId: (id: string) => void;
  setIsResponding: (isResponding: boolean) => void;
  deleteChat: (chatId: string) => Promise<void>;
  toggleChatTop: (chatId: string,isTop: boolean) => Promise<void>;
  getChatModelSettings: (chatId: string) => Promise<chatSettings>;
  updateChatModelSettings: (config: updateSettings) => Promise<string>;
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
                if (message.role === "assistant") {
                  message.content = message.content;
                  message.contentMd = marked.parse(message.content, {
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
                chat.title = resD.content.substring(0, 20);
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
        await handleStreamResponse(chatId, res, set, resolve);
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

        await handleStreamResponse(chatId, res, set, resolve);
      } catch (err) {
        reject(err);
      }
    });
  },
  reGenerateReply: async (chatId, messageId) => {
    return new Promise(async (resolve, reject) => {
      try {
        set((state) => {
          const chats = state.chats.map((c) => {
            if (c.id === chatId) {
              const position = c.messages.findIndex((m) => m.id === messageId);
              if (position != -1) {
                c.messages.splice(position, 1);
              }
            }
            return c;
          });
          return { chats };
        });
        const res = await httpStream.post(api.message.reGenerate, {
          conversationId: chatId,
          messageId,
        });

        await handleStreamResponse(chatId, res, set, resolve);
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
  toggleChatTop: async (chatId, isTop) => {
    const res = await http.post(api.conversation.toggleTop, { id: chatId, isTop });
    const newIsTop = res.data.isTop;
    set((state) => ({
      chats: state.chats
        .map((c) => (c.id === chatId ? { ...c, isTop: newIsTop } : c))
        .sort((a, b) => (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0)),
    }));
  },
  getChatModelSettings: async (chatId) => {
    return new Promise(async (resolve, reject) => {
      const res = await http.post(api.modelSettings.getConversationSettings, {
        conversationId: chatId,
      });
      const resD = res.data;
      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            chat.settings = resD;
            resD.title = chat.title;
            resD.model = chat.model;
          }
          return chat;
        });
        return { chats };
      });

      resolve(resD);
    });
  },
  updateChatModelSettings: async (updates) => {
    return new Promise(async (resolve, reject) => {
      const res = await http.post(
        api.modelSettings.updateConversationSettings,
        updates,
      );
      const resD = res.data;
      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === updates.conversationId) {
            const conversation = resD.conversation;
            conversation.settings = resD.settings;
            chat = { ...chat, ...conversation };
          }
          return chat;
        });
        return { chats };
      });
      resolve("更新成功");
    });
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

async function handleStreamResponse(
  chatId: string,
  response: Response,
  set: (updater: (state: any) => any) => void,
  resolve: (value: void | PromiseLike<void>) => void,
): Promise<void> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  let contentBuffer = "";
  let contentMd = "";
  let reasoningBuffer = "";
  let parseSchedule = false;
  let sseBuffer = ""; // 用于拼接不完整的 SSE 消息

  // 处理单条已解析的消息
  function handleChunk(chunk: any) {
    const { type, content, messageId: msgId } = chunk;

    if (type === "reasoning_content") {
      reasoningBuffer += content;
      setMessage(msgId, type, reasoningBuffer);
    } else if (type === "content") {
      contentBuffer += content;
      contentMd += content;
      if (!parseSchedule) {
        parseSchedule = true;
        setTimeout(() => {
          contentMd = marked.parse(contentBuffer, { async: false });
          parseSchedule = false;
        }, 500);
      }
      setMessage(msgId, type, contentMd, contentBuffer);
    } else if (type === "finish") {
      setMessage(msgId, type); // 只需要更新状态，不需要内容
    }
  }

  // 更新zustand状态
  function setMessage(
    id: string,
    type: string,
    displayContent?: string,
    originalContent?: string,
  ) {
    set((state: any) => {
      const chats = state.chats.map((c: any) => {
        if (c.id === chatId) {
          const message = c.messages.find((m: any) => m.id === id);
          if (message) {
            switch (type) {
              case "reasoning_content":
                message.reasoning = displayContent;
                break;
              case "content":
                message.content = originalContent;
                message.contentMd = displayContent;
                break;
              case "finish":
                message.status = "completed";
                break;
            }
          } else {
            // 新消息（例如 generateAiReply 首次创建）
            c.messages.push({
              role: "assistant",
              content: type === "content" ? contentBuffer : "",
              contentMd: type === "content" ? contentMd : "",
              reasoning: type === "reasoning_content" ? reasoningBuffer : "",
              id: id,
              tokensUsed: 0,
              status: type === "finish" ? "completed" : "generating",
            });
          }
        }
        return c;
      });
      return { chats };
    });
  }

  // 流读取循环
  while (true) {
    const { done, value } = await reader.read();
    const text = decoder.decode(value, { stream: !done });
    sseBuffer += text;

    // 按 SSE 双换行分割，保留最后一个不完整片段
    const parts = sseBuffer.split("\n\n");
    sseBuffer = parts.pop() || "";

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      try {
        const messageChunk = JSON.parse(trimmed);
        handleChunk(messageChunk);
      } catch (err) {
        console.error("JSON parse error:", err, "data:", trimmed);
      }
    }

    if (done) {
      // 处理可能残留的最后一条消息
      if (sseBuffer.trim()) {
        try {
          const messageChunk = JSON.parse(sseBuffer.trim());
          handleChunk(messageChunk);
        } catch (err) {
          console.error("Final chunk parse error:", err);
        }
      }
      // 强制最后一次 Markdown 解析并退出
      parseSchedule = true;
      contentMd = marked.parse(contentBuffer, { async: false });
      parseSchedule = false;
      resolve();
      break;
    }
  }
}
