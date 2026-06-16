/**
 * 上下文提取测试
 */

import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  extractContext,
  truncateContext,
  extractAroundCursor,
} from '../src/context/index.js';

describe('detectLanguage', () => {
  it('should detect TypeScript', () => {
    expect(detectLanguage('test.ts')).toBe('typescript');
    expect(detectLanguage('test.tsx')).toBe('typescript');
  });

  it('should detect JavaScript', () => {
    expect(detectLanguage('test.js')).toBe('javascript');
    expect(detectLanguage('test.jsx')).toBe('javascript');
  });

  it('should detect Python', () => {
    expect(detectLanguage('test.py')).toBe('python');
  });

  it('should detect Java', () => {
    expect(detectLanguage('Test.java')).toBe('java');
  });

  it('should detect Rust', () => {
    expect(detectLanguage('lib.rs')).toBe('rust');
  });

  it('should detect Go', () => {
    expect(detectLanguage('main.go')).toBe('go');
  });

  it('should return plaintext for unknown', () => {
    expect(detectLanguage('test.xyz')).toBe('plaintext');
  });
});

describe('extractContext', () => {
  it('should create context with files and cursor', () => {
    const ctx = extractContext(
      [{ path: 'test.ts', language: 'typescript', content: 'code' }],
      { line: 10, column: 5 },
    );
    expect(ctx.files.length).toBe(1);
    expect(ctx.cursor.line).toBe(10);
  });

  it('should include selected code', () => {
    const ctx = extractContext([], { line: 1, column: 1 }, 'selected code');
    expect(ctx.selectedCode).toBe('selected code');
  });
});

describe('truncateContext', () => {
  it('should not truncate short content', () => {
    const content = 'line1\nline2\nline3';
    expect(truncateContext(content, 10)).toBe(content);
  });

  it('should truncate long content', () => {
    const lines = Array.from({ length: 200 }, (_, i) => `line${i + 1}`).join('\n');
    const result = truncateContext(lines, 100);
    expect(result).toContain('// ... (truncated)');
    expect(result.split('\n').length).toBeLessThanOrEqual(101);
  });
});

describe('extractAroundCursor', () => {
  it('should extract lines around cursor', () => {
    const content = Array.from({ length: 50 }, (_, i) => `line${i + 1}`).join('\n');
    const result = extractAroundCursor(content, { line: 25, column: 1 }, 5, 5);
    const lines = result.split('\n');
    expect(lines.length).toBeLessThanOrEqual(11);
  });

  it('should handle cursor at start', () => {
    const content = 'line1\nline2\nline3';
    const result = extractAroundCursor(content, { line: 1, column: 1 }, 2, 2);
    expect(result).toContain('line1');
  });

  it('should handle cursor at end', () => {
    const content = 'line1\nline2\nline3';
    const result = extractAroundCursor(content, { line: 3, column: 1 }, 2, 2);
    expect(result).toContain('line3');
  });
});