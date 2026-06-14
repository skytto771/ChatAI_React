import React, { useState, useEffect } from 'react';
import { AVAILABLE_MODELS } from '@/types';
import { type chatSettings } from '@/types'; // 请根据实际路径导入
import styles from './index.module.scss';
import { useToast } from '@/context/ToastContext';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    handelEditChatModel: (config: chatSettings) => Promise<string>;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, handelEditChatModel }) => {
    const toast = useToast();

    // 表单状态 - 完整 chatSettings 字段
    const [title, setTitle] = useState('');
    const [model, setModel] = useState(AVAILABLE_MODELS[0]?.value || 'gpt-3.5-turbo');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [userPrompt, setUserPrompt] = useState('');

    // 上下文配置
    const [contextLimit, setContextLimit] = useState(10);
    const [maxTokens, setMaxTokens] = useState(2048);

    // 思考模式
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingMode, setThinkingMode] = useState<'fast' | 'balanced' | 'deep'>('balanced');

    // 功能开关
    const [enableWebSearch, setEnableWebSearch] = useState(false);
    const [enableCodeInterpreter, setEnableCodeInterpreter] = useState(false);
    const [enableFileUpload, setEnableFileUpload] = useState(false);

    // 模型参数
    const [temperature, setTemperature] = useState(0.7);
    const [topP, setTopP] = useState(1);
    const [frequencyPenalty, setFrequencyPenalty] = useState(0);
    const [presencePenalty, setPresencePenalty] = useState(0);

    // 响应配置
    const [responseFormat, setResponseFormat] = useState<'text' | 'json' | 'markdown'>('text');
    const [streamResponse, setStreamResponse] = useState(true);

    // 安全配置
    const [contentFilter, setContentFilter] = useState<'strict' | 'moderate' | 'loose'>('moderate');

    // 重置表单
    const resetForm = () => {
        setTitle('');
        setModel(AVAILABLE_MODELS[0]?.value || 'gpt-3.5-turbo');
        setSystemPrompt('');
        setUserPrompt('');
        setContextLimit(10);
        setMaxTokens(2048);
        setIsThinking(false);
        setThinkingMode('balanced');
        setEnableWebSearch(false);
        setEnableCodeInterpreter(false);
        setEnableFileUpload(false);
        setTemperature(0.7);
        setTopP(1);
        setFrequencyPenalty(0);
        setPresencePenalty(0);
        setResponseFormat('text');
        setStreamResponse(true);
        setContentFilter('moderate');
    };

    // 弹窗关闭时重置
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const handleCreate = async () => {
        const config: chatSettings = {
            title: title.trim() || undefined,
            model,
            systemPrompt: systemPrompt.trim() || undefined,
            userPrompt: userPrompt.trim() || undefined,
            contextLimit,
            maxTokens,
            isThinking,
            thinkingMode: isThinking ? thinkingMode : undefined,
            enableWebSearch,
            enableCodeInterpreter,
            enableFileUpload,
            temperature,
            topP,
            frequencyPenalty,
            presencePenalty,
            responseFormat,
            streamResponse,
            contentFilter,
        };
        try {
            await handelEditChatModel(config);
            toast.success('创建成功');
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
                    <h3>✨ 新建对话</h3>
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
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="给对话起个名字"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>选择模型</label>
                            <select value={model} onChange={(e) => setModel(e.target.value)}>
                                {AVAILABLE_MODELS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>AI 系统提示词</label>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                rows={3}
                                placeholder="例如：你是一个专业、友善的AI助手..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>用户角色描述 (可选)</label>
                            <textarea
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
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
                                <label>上下文轮数限制</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={contextLimit}
                                    onChange={(e) => setContextLimit(Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>最大输出 Tokens</label>
                                <input
                                    type="number"
                                    min={256}
                                    max={8192}
                                    step={256}
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                                />
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
                                    checked={isThinking}
                                    onChange={(e) => setIsThinking(e.target.checked)}
                                />
                                启用思考模式 (Chain-of-Thought)
                            </label>
                        </div>
                        {isThinking && (
                            <div className={styles.formGroup}>
                                <label>思考深度</label>
                                <select
                                    value={thinkingMode}
                                    onChange={(e) => setThinkingMode(e.target.value as any)}
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
                                    checked={enableWebSearch}
                                    onChange={(e) => setEnableWebSearch(e.target.checked)}
                                />
                                联网搜索
                            </label>
                            {/* <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={enableCodeInterpreter}
                                    onChange={(e) => setEnableCodeInterpreter(e.target.checked)}
                                />
                                代码解释器
                            </label> */}
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={enableFileUpload}
                                    onChange={(e) => setEnableFileUpload(e.target.checked)}
                                />
                                文件上传
                            </label>
                        </div>
                    </div>

                    {/* 模型参数 */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>🎛️ 模型参数</div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Temperature ({temperature})</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    value={temperature}
                                    onChange={(e) => setTemperature(Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Top P ({topP})</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={topP}
                                    onChange={(e) => setTopP(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Frequency Penalty</label>
                                <input
                                    type="number"
                                    min={-2}
                                    max={2}
                                    step={0.1}
                                    value={frequencyPenalty}
                                    onChange={(e) => setFrequencyPenalty(Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Presence Penalty</label>
                                <input
                                    type="number"
                                    min={-2}
                                    max={2}
                                    step={0.1}
                                    value={presencePenalty}
                                    onChange={(e) => setPresencePenalty(Number(e.target.value))}
                                />
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
                <button className={styles.createBtn} onClick={handleCreate}>创建对话</button>
            </div>
        </div>
    );
};

export default NewChatModal;