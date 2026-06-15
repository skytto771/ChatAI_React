import React, { useState, useEffect } from 'react';
import { AVAILABLE_MODELS } from '@/types';
import type { chatSettings } from '@/types'; // 请根据实际路径导入
import styles from './index.module.scss';
import { useToast } from '@/context/ToastContext';

interface selectChat extends chatSettings {
    conversationId: string;
}
interface EditChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    handelEditChatModel: (config: selectChat) => Promise<string>;
    selectChat:  selectChat;
}

const editChatModal: React.FC<EditChatModalProps> = ({ isOpen, onClose, handelEditChatModel, selectChat }) => {
    const toast = useToast();

    // 表单状态 - 完整 chatSettings 字段

    // 思考模式
    const [settingsForm, setSettingsForm] = useState<chatSettings>({
        title: '',
        model: AVAILABLE_MODELS[0]?.value,
        systemPrompt: '',
        userPrompt: '',
        contextLimit: 4096,
        maxTokens: 2048,
        isThinking: false,
        thinkingMode: 'fast',
        enableWebSearch: false,
        enableCodeInterpreter: false,
        enableFileUpload: false,
        temperature: 0.7,
        topP: 1,
        logprobs: false,
        topLogprobs: 0,
        responseFormat: 'text',
        streamResponse: true,
        contentFilter: 'strict',
    })

    // 上下文窗口大小选项
    const contextLimits = {
        1024: "1K",
        2048: "2K",
        4096: "4K",
        8192: "8K",
        16384: "16K",
        32768: "32K",
        65536: "64K",
        131072: "128K",
        262144: "256K",
        524288: "512K",
        1048576: "1M",
    }

    // // token 选项
    const tokenOptions = {
        1024: "1K",
        2048: "2K",
        4096: "4K",
        8192: "8K",
        16384: "16K",
        32768: "32K",
        65536: "64K",
        131072: "128K",
        262144: "256K",
        524288: "512K",
        1048576: "1M",
    }

    const onChangeV=(key: keyof chatSettings, value: any)=>{
        setSettingsForm(prev => ({
            ...prev,
            [key]: value,
        }))
    }

    // 重置表单
    const resetForm = () => {
        setSettingsForm({
            title: '',
            model: AVAILABLE_MODELS[0]?.value,
            systemPrompt: '',
            userPrompt: '',
            contextLimit: 4096,
            maxTokens: 2048,
            isThinking: false,
            thinkingMode: 'fast',
            enableWebSearch: false,
            enableCodeInterpreter: false,
            enableFileUpload: false,
            temperature: 0.7,
            topP: 1,
            logprobs: false,
            topLogprobs:  0,
            responseFormat: 'text',
            streamResponse: true,
            contentFilter: 'strict',
        })
    };

    // 弹窗关闭时重置
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    useEffect(() => { 
        if(!selectChat) return
        if(!selectChat.conversationId){
            onClose()
            toast.error('会话id丢失')
        }
        Object.keys(selectChat).forEach((key,index) => {
            const formVal = Object.keys(settingsForm)
            if(formVal.includes(key)){
                onChangeV(key as keyof chatSettings,Object.values(selectChat)[index])
            }
        });
    }, [selectChat]);

    const handleCreate = async () => {
        try {
            const res = await handelEditChatModel({conversationId:selectChat.conversationId, ...settingsForm});
            toast.success(res);
            onClose();
        } catch (err) {
            toast.error(err as string);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>✨ 对话模型设置</h3>
                    <button className={styles.modalCloseBtn} onClick={onClose}>✕</button>
                </div>
                <div className={styles.formContainer}>
                    {/* 基础信息 */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>📋 基础信息</div>
                        <div className={styles.formGroup}>
                            <label>对话标题 (可选)</label>
                            <input
                                type="text"
                                value={settingsForm.title}
                                onChange={(e) => onChangeV('title',e.target.value)}
                                placeholder="给对话起个名字"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>选择模型</label>
                            <select value={settingsForm.model} onChange={(e) => onChangeV('model',e.target.value)}>
                                {AVAILABLE_MODELS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>AI 系统提示词</label>
                            <textarea
                                value={settingsForm.systemPrompt}
                                onChange={(e) => onChangeV('systemPrompt',e.target.value)}
                                rows={3}
                                placeholder="例如：你是一个专业、友善的AI助手..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>用户角色描述 (可选)</label>
                            <textarea
                                value={settingsForm.userPrompt}
                                onChange={(e) => onChangeV('userPrompt',e.target.value)}
                                rows={2}
                                placeholder="例如：我是一名软件工程师..."
                            />
                        </div>
                    </div>

                    {/* 上下文配置 */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>💬 上下文配置</div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.settingsLabel}>
                                    记忆限制（上下文消息）
                                    </label>
                                    <select
                                        value={settingsForm.contextLimit}
                                        onChange={(e) => onChangeV('contextLimit',Number(e.target.value))}
                                        className={styles.settingsSelect}
                                    >
                                    {Object.keys(contextLimits).map((limit,index) => {
                                        return (
                                        <option key={limit} value={limit}>
                                            {Object.values(contextLimits)[index]}
                                        </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>最大输出 Tokens</label>
                                <select
                                    value={settingsForm.maxTokens}
                                    onChange={(e) => onChangeV('maxTokens',Number(e.target.value))}
                                    className={styles.settingsSelect}
                                >
                                    {Object.keys(tokenOptions).map((token,index) => (
                                        <option key={token} value={token}>
                                        {Object.values(tokenOptions)[index]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 思考模式 */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>🧠 思考模式</div>
                        <div className={styles.checkboxGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={settingsForm.isThinking}
                                    onChange={(e) => onChangeV('isThinking',e.target.checked)}
                                />
                                启用思考模式 (Chain-of-Thought)
                            </label>
                        </div>
                        {settingsForm.isThinking && (
                            <div className={styles.formGroup}>
                                <label>思考深度</label>
                                <select
                                    value={settingsForm.thinkingMode}
                                    onChange={(e) => onChangeV('thinkingMode',e.target.value as any)}
                                >
                                    <option value="fast">快速</option>
                                    <option value="balanced">平衡</option>
                                    <option value="deep">深度</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* 功能开关 */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>🔌 扩展功能</div>
                        <div className={styles.checkboxGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={settingsForm.enableWebSearch}
                                    onChange={(e) => onChangeV('thinkingMode',e.target.checked)}
                                />
                                联网搜索
                            </label>
                            {/* <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={settingsForm.enableCodeInterpreter}
                                    onChange={(e) => onChangeV(e.target.checked)}
                                />
                                代码解释器
                            </label> */}
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={settingsForm.enableFileUpload}
                                    onChange={(e) => onChangeV('enableFileUpload',e.target.checked)}
                                />
                                文件上传
                            </label>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={settingsForm.logprobs}
                                    onChange={(e) => onChangeV('logprobs',e.target.checked)}
                                />
                                logprobs
                            </label>
                        </div>
                    </div>

                    {/* 模型参数 */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>🎛️ 模型参数</div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Temperature ({settingsForm.temperature==0.7?'默认':settingsForm.temperature})</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    value={settingsForm.temperature}
                                    onChange={(e) => onChangeV('temperature',Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Top P ({settingsForm.topP==1 ? '默认' : settingsForm.topP})</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={settingsForm.topP}
                                    onChange={(e) => onChangeV('topP',Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            {settingsForm.logprobs && <div className={styles.formGroup}>
                                <label>topLogprobs ({settingsForm.topLogprobs})</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={20}
                                    step={0}
                                    value={settingsForm.topLogprobs}
                                    onChange={(e) => onChangeV('topLogprobs',Number(e.target.value))}
                                />
                            </div>}
                            <div className={styles.formGroup}>
                            </div>
                        </div>
                    </div>

                    {/* 响应配置 */}
                    {/* <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>📤 响应配置</div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>响应格式</label>
                                <select
                                    value={responseFormat}
                                    onChange={(e) => setResponseFormat(e.target.value as any)}
                                >
                                    <option value="text">纯文本</option>
                                    <option value="json">JSON</option>
                                    <option value="markdown">Markdown</option>
                                </select>
                            </div>
                            <div className={styles.checkboxGroup} style={{ justifyContent: 'flex-start' }}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={streamResponse}
                                        onChange={(e) => setStreamResponse(e.target.checked)}
                                    />
                                    流式响应
                                </label>
                            </div>
                        </div>
                    </div> */}

                    {/* 安全配置 */}
                    {/* <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>🛡️ 安全配置</div>
                        <div className={styles.formGroup}>
                            <label>内容过滤等级</label>
                            <select
                                value={contentFilter}
                                onChange={(e) => setContentFilter(e.target.value as any)}
                            >
                                <option value="strict">严格</option>
                                <option value="moderate">适中</option>
                                <option value="loose">宽松</option>
                            </select>
                        </div>
                    </div> */}
                </div>
                <button className={styles.createBtn} onClick={handleCreate}>提交修改</button>
            </div>
        </div>
    );
};

export default editChatModal;