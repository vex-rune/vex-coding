/**
 * Vex-Coding Core 模块导出
 */

// Types
export {
  LLMError,
  ErrorCode,
  DEFAULT_LLM_CONFIG,
} from './types/index.js';
export type {
  Position,
  FileInfo,
  Context,
  LLMConfig,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  TokenUsage,
  CompletionRequest,
  Completion,
  CompletionResponse,
  StreamChunk,
  ProjectConfig,
  RuleFile,
} from './types/index.js';

// Config
export { ConfigStore, getConfigStore, resetConfigStore } from './config/index.js';

// LLM
export { LLMClient } from './llm/client.js';
export type { LLMClientInterface } from './llm/types.js';

// Prompt
export {
  SYSTEM_PROMPTS,
  buildPrompt,
  buildCodeExplainPrompt,
  buildBugFixPrompt,
  buildRefactorPrompt,
  buildCodeGeneratePrompt,
  buildGeneralQAPrompt,
} from './prompt/index.js';
export type { PromptType } from './prompt/system.js';

// Context
export {
  detectLanguage,
  extractContext,
  truncateContext,
  extractAroundCursor,
} from './context/index.js';