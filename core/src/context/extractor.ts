/**
 * 上下文提取器
 */

import type { Context, FileInfo, Position } from '../types/index.js';

/** 语言检测 */
export function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';

  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    rb: 'ruby',
    java: 'java',
    kt: 'kotlin',
    go: 'go',
    rs: 'rust',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    md: 'markdown',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
  };

  return languageMap[ext] ?? 'plaintext';
}

/** 从文件内容提取上下文 */
export function extractContext(
  files: FileInfo[],
  cursor: Position,
  selectedCode?: string,
): Context {
  return {
    files,
    cursor,
    selectedCode,
  };
}

/** 截取上下文代码（限制行数） */
export function truncateContext(content: string, maxLines: number = 100): string {
  const lines = content.split('\n');
  if (lines.length <= maxLines) {
    return content;
  }
  return lines.slice(0, maxLines).join('\n') + '\n// ... (truncated)';
}

/** 提取光标周围的代码块 */
export function extractAroundCursor(
  content: string,
  position: Position,
  beforeLines: number = 10,
  afterLines: number = 10,
): string {
  const lines = content.split('\n');
  const start = Math.max(0, position.line - beforeLines - 1);
  const end = Math.min(lines.length, position.line + afterLines);

  return lines.slice(start, end).join('\n');
}