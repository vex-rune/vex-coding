/**
 * 类型定义测试
 */

import { describe, it, expect } from 'vitest';
import type {
  Position,
  FileInfo,
  Context,
  LLMConfig,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  CompletionRequest,
  Completion,
  CompletionResponse,
} from '../src/types/index.js';

describe('Position', () => {
  it('should have line and column', () => {
    const pos: Position = { line: 10, column: 5 };
    expect(pos.line).toBe(10);
    expect(pos.column).toBe(5);
  });
});

describe('FileInfo', () => {
  it('should contain file metadata', () => {
    const file: FileInfo = {
      path: 'src/main.ts',
      language: 'typescript',
      content: 'console.log("hello")',
    };
    expect(file.path).toBe('src/main.ts');
    expect(file.language).toBe('typescript');
    expect(file.content).toContain('hello');
  });
});

describe('Context', () => {
  it('should contain files and cursor', () => {
    const ctx: Context = {
      files: [{ path: 'test.ts', language: 'typescript', content: 'code' }],
      cursor: { line: 1, column: 1 },
    };
    expect(ctx.files.length).toBe(1);
    expect(ctx.cursor.line).toBe(1);
  });

  it('should allow optional selectedCode', () => {
    const ctx: Context = {
      files: [],
      cursor: { line: 1, column: 1 },
      selectedCode: 'const x = 1;',
    };
    expect(ctx.selectedCode).toBe('const x = 1;');
  });
});

describe('ChatMessage', () => {
  it('should have valid role', () => {
    const msg: ChatMessage = { role: 'user', content: 'hello' };
    expect(msg.role).toMatch(/^(user|assistant|system)$/);
  });
});

describe('ChatRequest', () => {
  it('should contain message and context', () => {
    const req: ChatRequest = {
      message: 'What does this do?',
      context: { files: [], cursor: { line: 1, column: 1 } },
      history: [],
    };
    expect(req.message).toBeTruthy();
    expect(req.context).toBeDefined();
  });
});

describe('Completion', () => {
  it('should have confidence score', () => {
    const comp: Completion = {
      text: 'return true;',
      startLine: 10,
      confidence: 0.95,
    };
    expect(comp.confidence).toBeGreaterThan(0);
    expect(comp.confidence).toBeLessThanOrEqual(1);
  });
});

describe('CompletionResponse', () => {
  it('should indicate source', () => {
    const resp: CompletionResponse = {
      completions: [{ text: 'test', startLine: 1, confidence: 0.8 }],
      source: 'remote',
    };
    expect(resp.source).toMatch(/^(local|remote)$/);
  });
});