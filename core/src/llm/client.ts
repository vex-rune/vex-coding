/**
 * LLM 客户端实现
 */

import { LLMConfig, ChatRequest, ChatResponse, CompletionRequest, CompletionResponse, StreamChunk, LLMError, ErrorCode } from '../types/index.js';
import type { ChatCompletionResponse, ChatCompletionChunk } from './types.js';

/** LLM 客户端 */
export class LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /** 更新配置 */
  setConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** 获取配置 */
  getConfig(): LLMConfig {
    return { ...this.config };
  }

  /** 发送聊天请求 */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const messages = this.buildMessages(request);

    const response = await this.fetch('/v1/chat/completions', {
      method: 'POST',
      body: {
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
      },
    });

    const data = response as ChatCompletionResponse;
    const content = data.choices[0]?.message?.content ?? '';

    return {
      content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }

  /** 发送流式聊天请求 */
  async *chatStream(request: ChatRequest): AsyncIterable<StreamChunk> {
    const messages = this.buildMessages(request);

    const response = await this.fetch('/v1/chat/completions', {
      method: 'POST',
      body: {
        model: this.config.model,
        messages,
        stream: true,
        max_tokens: this.config.maxTokens,
      },
    });

    const responseWithBody = response as Response;
    if (!responseWithBody.body) {
      throw new LLMError('无效的响应', ErrorCode.API_ERROR);
    }

    const reader = responseWithBody.body.getReader();
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
          const chunk = this.parseSSEChunk(line);
          if (chunk) {
            yield chunk;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /** 代码补全请求 */
  async completion(request: CompletionRequest): Promise<CompletionResponse> {
    const messages = [
      {
        role: 'system' as const,
        content: '你是一个代码补全助手。根据上下文，预测最可能的代码补全。',
      },
      {
        role: 'user' as const,
        content: `文件: ${request.filePath}\n语言: ${request.language}\n上下文:\n${request.context}`,
      },
    ];

    const response = await this.fetch('/v1/chat/completions', {
      method: 'POST',
      body: {
        model: this.config.model,
        messages,
        max_tokens: Math.min(this.config.maxTokens, 256),
      },
    });

    const data = response as ChatCompletionResponse;
    const content = data.choices[0]?.message?.content ?? '';

    return {
      completions: [{
        text: content,
        startLine: request.position.line,
        confidence: 0.8,
      }],
      source: 'remote',
    };
  }

  /** 构建消息列表 */
  private buildMessages(request: ChatRequest): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    // 添加历史消息
    for (const msg of request.history) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // 添加上下文
    if (request.context.files.length > 0) {
      const contextText = request.context.files
        .map(f => `文件: ${f.path}\n\`\`\`${f.language}\n${f.content}\n\`\`\``)
        .join('\n\n');
      messages.push({
        role: 'system',
        content: `相关代码上下文:\n${contextText}`,
      });
    }

    // 添加用户消息
    messages.push({
      role: 'user',
      content: request.message,
    });

    return messages;
  }

  /** 发送 API 请求 */
  private async fetch(
    path: string,
    options: {
      method: string;
      body: Record<string, unknown>;
    },
  ): Promise<unknown> {
    const url = `${this.config.apiEndpoint}${path}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout ?? 60000);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(options.body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new LLMError(
          `API 请求失败: ${errorText}`,
          ErrorCode.API_ERROR,
          response.status,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new LLMError('请求超时', ErrorCode.TIMEOUT);
      }
      throw new LLMError(
        `网络错误: ${error instanceof Error ? error.message : 'Unknown'}`,
        ErrorCode.NETWORK_ERROR,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /** 解析 SSE chunk */
  private parseSSEChunk(line: string): StreamChunk | null {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('data: ')) {
      return null;
    }

    const data = trimmed.slice(6);
    if (data === '[DONE]') {
      return { content: '', done: true };
    }

    try {
      const chunk = JSON.parse(data) as ChatCompletionChunk;
      const content = chunk.choices[0]?.delta?.content ?? '';

      return {
        content,
        done: chunk.choices[0]?.finish_reason !== undefined,
      };
    } catch {
      return null;
    }
  }
}