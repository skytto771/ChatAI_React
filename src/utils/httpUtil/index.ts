import axios from "axios";
import { session } from '../sessionUtil'

const baseUrl = import.meta.env.MODE === 'development' ? import.meta.env.VITE_DEVELOPMENT_API_URL : import.meta.env.VITE_PRODUCTION_API_URL;
console.log('mode:', import.meta.env.MODE);
console.log('baseUrl:', baseUrl);
const http = axios.create({
    baseURL: baseUrl,
    timeout: 200000,
    headers: {
        "Content-Type": "application/json",
    },
});

http.interceptors.request.use(
    (config) => {
        const token = session.getToken();
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

http.interceptors.response.use(
    (response) => {
        console.log('response:', response)
        if(response.data.code === 0) return response.data;
    },
    (error) => {
        console.log('error:', error.response)
        const code = error.response.data.code;
        if(error.response.data.message) return Promise.reject(error.response.data.message);
        let message = ''
        switch (code) {
            case 1000:
                message = '参数错误';
                break;
            case 1001:
                message = '缺少必要参数';
                break;
            case 1002:
                message = '参数格式不正确';
                break;
            case 2000:
                message = '请先登录';
                break;
            case 2001:
                message = '令牌已过期';
                break;
            case 2002:
                message = '无效的令牌';
                break;
            case 2003:
                message = '权限不足';
                break;
            default:
                message = '未知错误';
        }
        return Promise.reject(message);
    }
);

export { http }