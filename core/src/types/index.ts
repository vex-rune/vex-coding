/**
 * Vex-Coding 核心类型定义
 */

/** 位置信息 */
export interface Position {
  line: number;
  column: number;
}

/** 文件信息 */
export interface FileInfo {
  path: string;
  language: string;
  content: string;
}

/** 代码上下文 */
export interface Context {
  files: FileInfo[];
  cursor: Position;
  selectedCode?: string;
}

/** LLM 配置 */
export interface LLMConfig {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  timeout?: number;
  proxy?: string;
}

/** LLM 默认配置 */
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  apiEndpoint: 'https://token-plan-cn.xiaomimimo.com/v1',
  apiKey: '',
  model: 'mimo-pro',
  maxTokens: 2048,
  timeout: 60000,
};

/** 聊天消息 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** 聊天请求 */
export interface ChatRequest {
  message: string;
  context: Context;
  history: ChatMessage[];
}

/** 聊天响应 */
export interface ChatResponse {
  content: string;
  usage?: TokenUsage;
}

/** Token 使用量 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** 代码补全请求 */
export interface CompletionRequest {
  filePath: string;
  position: Position;
  language: string;
  context: string;
}

/** 代码补全项 */
export interface Completion {
  text: string;
  startLine: number;
  confidence: number;
}

/** 代码补全响应 */
export interface CompletionResponse {
  completions: Completion[];
  source: 'local' | 'remote';
}

/** 流式响应块 */
export interface StreamChunk {
  content: string;
  done: boolean;
  usage?: TokenUsage;
}

/** 错误类型 */
export class LLMError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

/** 错误码 */
export const ErrorCode = {
  INVALID_CONFIG: 'INVALID_CONFIG',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  PARSE_ERROR: 'PARSE_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/** 项目配置 */
export interface ProjectConfig {
  rulesPath?: string;
  ignorePath?: string;
  indexOnStartup: boolean;
}

/** 规则文件 */
export interface RuleFile {
  name: string;
  content: string;
  path: string;
}