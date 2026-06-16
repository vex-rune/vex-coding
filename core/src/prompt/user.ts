/**
 * Prompt 模板 - 用户提示词构建
 */

import type { Context } from '../types/index.js';

/** 构建代码解释的用户提示词 */
export function buildCodeExplainPrompt(context: Context, selectedCode: string): string {
  return `请解释以下代码：

\`\`\`${context.files[0]?.language ?? ''}
${selectedCode}
\`\`\`

文件路径: ${context.files[0]?.path ?? '未知'}`;
}

/** 构建 Bug 修复的用户提示词 */
export function buildBugFixPrompt(
  context: Context,
  errorMessage?: string,
  selectedCode?: string,
): string {
  let prompt = '';

  if (errorMessage) {
    prompt += `错误信息:\n${errorMessage}\n\n`;
  }

  if (selectedCode) {
    prompt += `有问题的代码:\n\`\`\`${context.files[0]?.language ?? ''}\n${selectedCode}\n\`\`\`\n\n`;
  }

  if (context.files.length > 0) {
    prompt += `相关上下文:\n${context.files.map(f => `文件: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}`;
  }

  prompt += '\n\n请分析问题并提供修复方案。';

  return prompt;
}

/** 构建代码重构的用户提示词 */
export function buildRefactorPrompt(
  context: Context,
  selectedCode: string,
  refactorGoal?: string,
): string {
  let prompt = `请重构以下代码`;

  if (refactorGoal) {
    prompt += `，目标: ${refactorGoal}`;
  }

  prompt += `：

\`\`\`${context.files[0]?.language ?? ''}
${selectedCode}
\`\`\`

文件路径: ${context.files[0]?.path ?? '未知'}`;

  return prompt;
}

/** 构建代码生成的用户提示词 */
export function buildCodeGeneratePrompt(
  language: string,
  description: string,
  context?: Context,
): string {
  let prompt = `请生成 ${language} 代码

功能描述:
${description}`;

  if (context && context.files.length > 0) {
    prompt += `\n\n参考代码:\n${context.files.map(f => `文件: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}`;
  }

  return prompt;
}

/** 构建通用问答的用户提示词 */
export function buildGeneralQAPrompt(message: string, context?: Context): string {
  let prompt = message;

  if (context && context.files.length > 0) {
    prompt += `\n\n相关代码:\n${context.files.map(f => `文件: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}`;
  }

  return prompt;
}