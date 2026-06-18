const api = {
  user: {
    getUser: "/user/getUsers",
    detail: "/user/detail",
    register: "/user/register",
    login: "/user/login",
    editUser: "/user/editUser",
    setAvatarUrl: "/user/setAvatarUrl",
    refreshToken: "/user/refreshToken",
    forgotPassword: "/user/forgotPassword",
    resetPassword: "/user/resetPassword",
  },
  upload: {
    largeFileInit: "/upload/largeFileInit",
    chunk: "/upload/chunk",
    mergeComplete: "/upload/mergeComplete",
    cancelUpload: "/upload/cancelUpload",
    getFileUrl: "/upload/getFileUrl",
    uploadSmall: "/upload/uploadSmall",
  },
  verification: {
    sendCode: "/verification/sendCode",
  },
  conversation: {
    addConversation: "/conversation/addConversation",
    getConversationList: "/conversation/getConversationList",
    stats: "/conversation/stats",
    getConversationById: "/conversation/getConversationById",
    updateConversation: "/conversation/updateConversation",
    delConversation: "/conversation/delConversation",
    archived: "/conversation/archived",
    toggleTop: "/conversation/toggleTop",
  },
  message: {
    addMessage: "/message/addMessage",
    getMessageList: "/message/getMessageList",
    generateAiReply: "/message/generateAiReply",
    resumeReply: "/message/resume",
    update: "/message/update",
    reGenerate: "/message/reGenerate",
    editAndRegenerate: "/message/editAndRegenerate",
  },
  modelSettings: {
    getSettings: "/modelSettings/getSettings",
    updateSettings: "/modelSettings/updateSettings",
    getConversationSettings: "/modelSettings/getConversationSettings",
    updateConversationSettings: "/modelSettings/updateConversationSettings",
  },
};

export default api;
