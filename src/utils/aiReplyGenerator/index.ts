export function generateSmartReply(
    userMessage: string,
    systemPrompt: string = '',
    userPrompt: string = ''
): string {
    const lower = userMessage.toLowerCase();

    // 优先使用自定义提示词影响回复（演示用，实际应调用 API）
    let prefix = '';
    if (systemPrompt) {
        prefix = `📝 遵循提示词："${systemPrompt.slice(0, 40)}${systemPrompt.length > 40 ? '…' : ''}"\n`;
    }
    if (userPrompt) {
        prefix += `🧑 角色："${userPrompt.slice(0, 40)}${userPrompt.length > 40 ? '…' : ''}"\n`;
    }

    let reply = '';
    if (lower.includes('你好') || lower.includes('hi') || lower.includes('hello')) {
        reply = '你好！😊 今天想聊点什么？';
    } else if (lower.includes('主题') || lower.includes('颜色')) {
        reply = '你可以在设置中调整主题、模型和提示词。';
    } else if (lower.includes('代码') || lower.includes('bug')) {
        reply = '🐞 调试建议：检查变量作用域，或者用 <code>console.log</code> 打印关键值。需要具体看看代码吗？';
    } else if (lower.includes('旅行') || lower.includes('旅游')) {
        reply = '✈️ 推荐小众目的地：云南沙溪、福建霞浦、川西格聂。你喜欢自然风光还是人文历史？';
    } else if (lower.includes('笑话')) {
        reply = '为什么程序员喜欢暗色主题？因为光太亮会吸引 bug！😄';
    } else {
        const replies = [
            '这很有趣！可以再详细说说吗？',
            '我理解你的意思了。让我想想……',
            '从我的知识库来看，这个问题有几个角度。',
            '✨ 好问题！以下是我的分析：',
            '👀 正在为你检索最佳答案……'
        ];
        reply = replies[Math.floor(Math.random() * replies.length)];
    }

    return prefix + reply;
}