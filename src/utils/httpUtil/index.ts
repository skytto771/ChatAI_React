import axios, { type AxiosRequestConfig } from "axios";
import { session } from '../sessionUtil'

const baseUrl = import.meta.env.MODE === 'development' ? import.meta.env.VITE_DEVELOPMENT_API_URL : import.meta.env.VITE_PRODUCTION_API_URL;

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
        if(response.headers["Content-Type"] === 'text/event-stream'){
            return response.data;
        }
        if(response.data.code === 0) return response.data;
    },
    (error) => {
        if(!error.response){
            return Promise.reject('与服务器断开链接');
        }
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
            case 3000:
                message = '用户不存在';
                break;
            case 3001:
                message = '用户已存在';
                break;
            case 3002:
                message = '密码错误';
                break;
            case 4000:
                message = '请求的资源不存在';
                break;
            case 4001:
                message = '资源已存在';
                break;
            default:
                message = '未知错误';
        }
        return Promise.reject(message);
    }
);

interface api { 
    post: (url: string, data?: {}, config?: AxiosRequestConfig<{}> | undefined) => Promise<Response>;
}

const httpStream:api = {
    post: async (url: string, data?: {} | undefined, config?: AxiosRequestConfig<{}> | undefined)=>{
        return new Promise(async (resolve, reject)=>{
            try{
                const res = await fetch(baseUrl + url,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': session.getToken() || 'undefined'
                    },
                    body: JSON.stringify(data)
                })
                if(!res.headers.get('content-type')?.includes('event-stream')){
                    throw new Error('接口返回数据格式错误')
                }
                resolve(res)
            }catch(err){
                console.log('err:', err)
                reject(err)
            }
        })
    },
}



export { http, httpStream }