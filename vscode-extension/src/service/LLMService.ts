/**
 * LLM 服务
 */

import { ConfigService } from '../config/index.js';
import { Context } from './ContextService.js';

/**
 * LLM 错误
 */
export class LLMError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'LLMError';
    }
}

/**
 * LLM 服务
 */
export class LLMService {
    
    constructor(private config: ConfigService) {}
    
    /**
     * 发送聊天消息
     */
    async chat(message: string, context: Context): Promise<string> {
        if (!this.config.isConfigured()) {
            throw new LLMError('请先配置 API Key', 'NOT_CONFIGURED');
        }
        
        const messages = this.buildMessages(message, context);
        
        const response = await fetch(`${this.config.getApiEndpoint()}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.getApiKey()}`,
            },
            body: JSON.stringify({
                model: this.config.getModel(),
                messages,
                max_tokens: this.config.getMaxTokens(),
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new LLMError(
                `API 请求失败: ${errorText}`,
                'API_ERROR',
                response.status
            );
        }
        
        const data = await response.json();
        return this.parseResponse(data);
    }
    
    /**
     * 流式聊天
     */
    async *chatStream(message: string, context: Context): AsyncGenerator<string> {
        if (!this.config.isConfigured()) {
            throw new LLMError('请先配置 API Key', 'NOT_CONFIGURED');
        }
        
        const messages = this.buildMessages(message, context);
        
        const response = await fetch(`${this.config.getApiEndpoint()}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.getApiKey()}`,
            },
            body: JSON.stringify({
                model: this.config.getModel(),
                messages,
                max_tokens: this.config.getMaxTokens(),
                stream: true,
            }),
        });
        
        if (!response.ok) {
            throw new LLMError('API 请求失败', 'API_ERROR', response.status);
        }
        
        if (!response.body) {
            throw new LLMError('无效的响应', 'INVALID_RESPONSE');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                
                for (const line of lines) {
                    const chunk = this.parseStreamChunk(line);
                    if (chunk) {
                        yield chunk;
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }
    
    /**
     * 构建消息
     */
    private buildMessages(message: string, context: Context): Array<{ role: string; content: string }> {
        const messages: Array<{ role: string; content: string }> = [];
        
        if (context.files.length > 0) {
            const contextText = context.files
                .map(f => `文件: ${f.path}\n\`\`\`${f.language}\n${f.content}\n\`\`\``)
                .join('\n\n');
            
            messages.push({
                role: 'system',
                content: `相关代码上下文:\n${contextText}`,
            });
        }
        
        messages.push({
            role: 'user',
            content: message,
        });
        
        return messages;
    }
    
    /**
     * 解析响应
     */
    private parseResponse(data: { choices?: Array<{ message?: { content?: string } }> }): string {
        return data.choices?.[0]?.message?.content ?? '';
    }
    
    /**
     * 解析流式块
     */
    private parseStreamChunk(line: string): string | null {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) {
            return null;
        }
        
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
            return null;
        }
        
        try {
            const chunk = JSON.parse(data);
            const content = chunk.choices?.[0]?.delta?.content;
            return content ?? null;
        } catch {
            return null;
        }
    }
}