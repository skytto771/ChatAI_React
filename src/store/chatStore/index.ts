import { create } from "zustand";
import type { Chat, ChatState, chatSettings } from "@/types";
import { http, marked } from "@/utils";
import api from "@/api";
import { httpStream } from "@/utils/httpUtil";

interface updateSettings extends chatSettings {
  conversationId: string;
}

interface ChatStore extends ChatState {
  archivedChats: Chat[];
  settings: chatSettings;
  loadChats: () => Promise<void>;
  loadArchivedChats: () => Promise<void>;
  restoreChat: (chatId: string) => Promise<void>;
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
  editMessage: (
    chatId: string,
    messageId: string,
    text: string,
  ) => Promise<void>;
  createNewChat: (config: chatSettings) => Promise<string>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  setActiveChatId: (id: string) => void;
  setIsResponding: (isResponding: boolean) => void;
  archiveChat: (chatId: string) => Promise<void>;
  deleteArchivedChat: (chatId: string) => Promise<void>;
  clearArchivedChats: () => Promise<void>;
  toggleChatTop: (chatId: string, isTop: boolean) => Promise<void>;
  getChatModelSettings: (chatId: string) => Promise<chatSettings>;
  updateChatModelSettings: (config: updateSettings) => Promise<string>;
  updateUserModelSettings: (settings: chatSettings) => Promise<void>;
  loadModelSettings: () => Promise<void>;
  initPage: () => Promise<{ status: "generating" | "completed"; messageId?: string; chatId: string }>;
}

export const useChatStore = create<ChatStore>((set, _get) => ({
  chats: [],
  archivedChats: [],
  activeChatId: "",
  isResponding: false,
  settings: {},

  loadChats: async () => {
    return new Promise(async (resolve, reject) => {
      const actConversationId =
        localStorage.getItem("activeConversationId") || "";
      let hasId = false;

      try {
        const res = await http.post(api.conversation.getConversationList, {
          isArchived: "false",
        });
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

  loadArchivedChats: async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await http.post(api.conversation.getConversationList, {
          isArchived: "true",
        });
        const resd = res.data;
        set({ archivedChats: resd.rows });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  restoreChat: async (chatId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await http.post(api.conversation.unarchiveConversation, { id: chatId });
        set((state) => {
          const restored = state.archivedChats.find((c) => c.id === chatId);
          const newArchived = state.archivedChats.filter(
            (c) => c.id !== chatId,
          );
          if (restored) {
            return {
              archivedChats: newArchived,
              chats: [restored, ...state.chats],
            };
          }
          return { archivedChats: newArchived };
        });
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

  editMessage: async (chatId, messageId, text) => {
    return new Promise(async (resolve, reject) => {
      try {
        // 更新本地：修改消息内容并删除后续消息
        set((state) => {
          const chats = state.chats.map((c) => {
            if (c.id === chatId) {
              const position = c.messages.findIndex((m) => m.id === messageId);
              if (position !== -1) {
                c.messages[position] = {
                  ...c.messages[position],
                  content: text,
                };
                c.messages.splice(position + 1);
              }
            }
            return c;
          });
          return { chats };
        });

        // 调用后端 editAndRegenerate（更新消息 + 删除后续 + AI 重新生成）
        const res = await httpStream.post(api.message.editAndRegenerate, {
          conversationId: chatId,
          messageId,
          content: text,
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

  archiveChat: async (chatId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await http.post(api.conversation.delConversation, { id: chatId });
        set((state) => {
          const newChats = state.chats.filter((c) => c.id !== chatId);
          const archivedChat = state.chats.find((c) => c.id === chatId);
          const newActiveId = newChats.length > 0 ? newChats[0].id : "";
          localStorage.setItem("ai-chats", JSON.stringify(newChats));
          const newArchived = archivedChat
            ? [{ ...archivedChat, isArchived: true }, ...state.archivedChats]
            : state.archivedChats;
          return {
            chats: newChats,
            activeChatId: newActiveId,
            archivedChats: newArchived,
          };
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
  deleteArchivedChat: async (chatId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await http.post(api.conversation.archivedDel, { id: chatId });
        set((state) => ({
          archivedChats: state.archivedChats.filter((c) => c.id !== chatId),
        }));
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  clearArchivedChats: async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await http.post(api.conversation.archivedAll, {});
        set({ archivedChats: [] });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
  toggleChatTop: async (chatId, isTop) => {
    const res = await http.post(api.conversation.toggleTop, {
      id: chatId,
      isTop,
    });
    const newIsTop = res.data.isTop;
    set((state) => ({
      chats: state.chats
        .map((c) => (c.id === chatId ? { ...c, isTop: newIsTop } : c))
        .sort((a, b) => (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0)),
    }));
  },
  getChatModelSettings: async (chatId) => {
    return new Promise(async (resolve) => {
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
    return new Promise(async (resolve) => {
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
    return new Promise(async (resolve) => {
      try {
        const res = await http.post(api.modelSettings.getSettings, {});
        const settings = res.data;
        set({ settings });
        resolve();
      } catch (err) {
        throw err;
      }
    });
  },

  initPage: async () => {
    const actConversationId =
      localStorage.getItem("activeConversationId") || "";

    const [chatListRes, settingsRes] = await Promise.all([
      http.post(api.conversation.getConversationList, {
        isArchived: "false",
      }),
      http.post(api.modelSettings.getSettings, {}),
    ]);

    const chatRows: any[] = chatListRes.data.rows;
    const hasId = chatRows.some((c: any) => c.id === actConversationId);
    const activeChatId = hasId ? actConversationId : "";

    let messageRows: any[] = [];
    if (activeChatId) {
      const msgRes = await http.post(api.message.getMessageList, {
        conversationId: activeChatId,
      });
      messageRows = msgRes.data.rows;
    }

    let generatingMsgId: string | undefined;
    set({
      activeChatId,
      settings: settingsRes.data,
      chats: chatRows.map((c: any) => {
        if (c.id === activeChatId) {
          c.messages = messageRows.map((m: any) => {
            if (m.role === "assistant") {
              m.contentMd = marked.parse(m.content, { async: false });
            }
            if (m.status === "generating") {
              generatingMsgId = m.id;
            }
            return m;
          });
        }
        return c;
      }),
    });

    if (generatingMsgId) {
      return { status: "generating", messageId: generatingMsgId, chatId: activeChatId };
    }
    return { status: "completed", chatId: activeChatId };
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
  let reasoningBuffer = "";
  let sseBuffer = "";
  let lastMsgId = "";
  let contentMdParsed = ""; // 最近一次 marked.parse 的结果
  let parseTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId: ReturnType<typeof requestAnimationFrame> | null = null;
  let dirty = false;

  // --- 每帧最多调用一次 set()，合并累积的 buffer ---
  function flushSet() {
    rafId = null;
    dirty = false;
    const id = lastMsgId;
    const parsed = contentMdParsed;
    const raw = contentBuffer;
    const reasoning = reasoningBuffer;

    set((state: any) => {
      const chats = state.chats.map((c: any) => {
        if (c.id === chatId) {
          const message = c.messages.find((m: any) => m.id === id);
          if (message) {
            message.content = raw;
            message.contentMd = parsed;
            message.reasoning = reasoning;
          } else {
            c.messages.push({
              role: "assistant",
              content: raw,
              contentMd: parsed,
              reasoning,
              id,
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

  function scheduleFlush() {
    if (rafId !== null) return; // 已有待处理的 RAF
    dirty = true;
    rafId = requestAnimationFrame(() => {
      if (dirty) flushSet();
    });
  }

  // --- Markdown 解析定时器（500ms 间隔解析，避免高频 marked.parse） ---
  function scheduleMarked() {
    if (parseTimer !== null) return;
    parseTimer = setTimeout(() => {
      parseTimer = null;
      contentMdParsed = marked.parse(contentBuffer, { async: false }) as string;
      scheduleFlush(); // 解析完成后推一帧
    }, 500);
  }

  function handleChunk(chunk: any) {
    const { type, content, messageId: msgId } = chunk;
    lastMsgId = msgId;

    if (type === "reasoning_content") {
      reasoningBuffer += content;
      scheduleFlush();
    } else if (type === "content") {
      contentBuffer += content;
      // 实时预览：直接用原始文本（无 Markdown），解析的版本通过定时器异步更新
      contentMdParsed = contentBuffer;
      scheduleMarked();
      scheduleFlush();
    } else if (type === "finish") {
      // 最终解析
      if (parseTimer !== null) {
        clearTimeout(parseTimer);
        parseTimer = null;
      }
      contentMdParsed = marked.parse(contentBuffer, { async: false }) as string;
      // finish 需要立即 set status
      rafId = null; // 取消待处理的 RAF
      dirty = false;
      const id = msgId;
      const parsed = contentMdParsed;
      const raw = contentBuffer;
      const reasoning = reasoningBuffer;
      set((state: any) => {
        const chats = state.chats.map((c: any) => {
          if (c.id === chatId) {
            const message = c.messages.find((m: any) => m.id === id);
            if (message) {
              message.content = raw;
              message.contentMd = parsed;
              message.reasoning = reasoning;
              message.status = "completed";
            }
          }
          return c;
        });
        return { chats };
      });
    }
  }

  // --- 流读取循环 ---
  while (true) {
    const { done, value } = await reader.read();
    const text = decoder.decode(value, { stream: !done });
    sseBuffer += text;

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
      if (sseBuffer.trim()) {
        try {
          const messageChunk = JSON.parse(sseBuffer.trim());
          handleChunk(messageChunk);
        } catch (err) {
          console.error("Final chunk parse error:", err);
        }
      }
      // 确保最终一帧被推送
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (parseTimer !== null) {
        clearTimeout(parseTimer);
        parseTimer = null;
      }
      contentMdParsed = marked.parse(contentBuffer, { async: false }) as string;
      if (dirty) flushSet();
      resolve();
      break;
    }
  }
}
