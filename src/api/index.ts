const api = {
    user:{
        getUser: '/user/getUsers',
        detail: '/user/detail',
        register: '/user/register',
        login: '/user/login',
        editUser: '/user/editUser',
        setAvatarUrl: '/user/setAvatarUrl'
    },
    upload:{
        largeFileInit: '/upload/largeFileInit',
        chunk: '/upload/chunk',
        mergeComplete: '/upload/mergeComplete',
        cancelUpload: '/upload/cancelUpload',
        getFileUrl: '/upload/getFileUrl',
        uploadSmall: '/upload/uploadSmall',
    },
    verification:{
        sendCode: '/verification/sendCode',
    },
    conversation:{
        addConversation: '/conversation/addConversation',
        getConversationList: '/conversation/getConversationList',
        stats: '/conversation/stats',
        getConversationById: '/conversation/getConversationById',
        updateConversation: '/conversation/updateConversation',
        delConversation: '/conversation/delConversation',
        archived: '/conversation/archived',
    },
    message: {
        addMessage: '/message/addMessage',
        getMessageList: '/message/getMessageList',
        generateAiReply: '/message/generateAiReply',
        resumeReply: '/message/resume',
    },
    modelSettings:{
        getSettings: '/modelSettings/getSettings',
        updateSettings: '/modelSettings/updateSettings',
    }
}

export default api