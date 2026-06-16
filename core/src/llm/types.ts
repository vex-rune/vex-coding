/**
 * LLM 模块类型定义
 */

import type {
  ChatRequest,
  ChatResponse,
  CompletionRequest,
  CompletionResponse,
  ChatMessage,
  StreamChunk,
  LLMConfig,
} from '../types/index.js';

export {
  ChatRequest,
  ChatResponse,
  CompletionRequest,
  CompletionResponse,
  ChatMessage,
  StreamChunk,
  LLMConfig,
};

/** API 请求体 */
export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

/** API 响应体 */
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** API 流式响应块 */
export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
}

/** LLM 客户端接口 */
export interface LLMClientInterface {
  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream(request: ChatRequest): AsyncIterable<StreamChunk>;
  completion(request: CompletionRequest): Promise<CompletionResponse>;
}