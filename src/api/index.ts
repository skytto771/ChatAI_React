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
    }
}

export default api