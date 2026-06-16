/**
 * Prompt 模块导出
 */

import type { Context } from '../types/index.js';
import { PromptType, SYSTEM_PROMPTS } from './system.js';
export type { PromptType } from './system.js';

export {
  CODE_EXPLAIN_PROMPT,
  BUG_FIX_PROMPT,
  REFACTOR_PROMPT,
  CODE_GENERATE_PROMPT,
  GENERAL_QA_PROMPT,
  SYSTEM_PROMPTS,
} from './system.js';

export {
  buildCodeExplainPrompt,
  buildBugFixPrompt,
  buildRefactorPrompt,
  buildCodeGeneratePrompt,
  buildGeneralQAPrompt,
} from './user.js';

import {
  buildCodeExplainPrompt,
  buildBugFixPrompt,
  buildRefactorPrompt,
  buildCodeGeneratePrompt,
  buildGeneralQAPrompt,
} from './user.js';

/**
 * 根据类型构建 Prompt
 */
export function buildPrompt(
  type: PromptType,
  message: string,
  context?: Context,
): string {
  const systemPrompt = SYSTEM_PROMPTS[type];

  switch (type) {
    case 'codeExplain':
      return `${systemPrompt}\n\n${buildCodeExplainPrompt(context!, message)}`;
    case 'bugFix':
      return `${systemPrompt}\n\n${buildBugFixPrompt(context!, undefined, message)}`;
    case 'refactor':
      return `${systemPrompt}\n\n${buildRefactorPrompt(context!, message)}`;
    case 'codeGenerate':
      return `${systemPrompt}\n\n${buildCodeGeneratePrompt('typescript', message, context)}`;
    default:
      return `${systemPrompt}\n\n${buildGeneralQAPrompt(message, context)}`;
  }
}