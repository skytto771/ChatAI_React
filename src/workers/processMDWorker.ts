// markdownWorker.ts
import { marked } from 'marked';

// 监听主线程消息
self.onmessage = async (event: MessageEvent) => {
    const { id, content } = event.data;
    try {
        // 执行 markdown 解析（异步，但内部是同步处理大文本）
        const html = marked.parse(content, { async: false }) as string;
        // 将结果回传给主线程
        self.postMessage({ id, html, success: true });
    } catch (error) {
        self.postMessage({ id, error: (error as Error).message, success: false });
    }
};