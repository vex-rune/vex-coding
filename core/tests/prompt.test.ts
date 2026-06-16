/**
 * Prompt 模板测试
 */

import { describe, it, expect } from 'vitest';
import {
  SYSTEM_PROMPTS,
  buildPrompt,
  buildCodeExplainPrompt,
  buildBugFixPrompt,
  buildRefactorPrompt,
  buildCodeGeneratePrompt,
  buildGeneralQAPrompt,
} from '../src/prompt/index.js';
import type { Context } from '../src/types/index.js';

describe('SYSTEM_PROMPTS', () => {
  it('should have all prompt types', () => {
    expect(SYSTEM_PROMPTS.codeExplain).toBeTruthy();
    expect(SYSTEM_PROMPTS.bugFix).toBeTruthy();
    expect(SYSTEM_PROMPTS.refactor).toBeTruthy();
    expect(SYSTEM_PROMPTS.codeGenerate).toBeTruthy();
    expect(SYSTEM_PROMPTS.generalQA).toBeTruthy();
  });
});

describe('buildCodeExplainPrompt', () => {
  it('should include selected code', () => {
    const ctx: Context = {
      files: [{ path: 'test.ts', language: 'typescript', content: 'test' }],
      cursor: { line: 1, column: 1 },
    };
    const prompt = buildCodeExplainPrompt(ctx, 'const x = 1;');
    expect(prompt).toContain('const x = 1;');
  });
});

describe('buildBugFixPrompt', () => {
  it('should include error message', () => {
    const ctx: Context = {
      files: [],
      cursor: { line: 1, column: 1 },
    };
    const prompt = buildBugFixPrompt(ctx, 'TypeError: undefined');
    expect(prompt).toContain('TypeError: undefined');
  });

  it('should include selected code', () => {
    const ctx: Context = {
      files: [{ path: 'test.ts', language: 'typescript', content: 'test' }],
      cursor: { line: 1, column: 1 },
    };
    const prompt = buildBugFixPrompt(ctx, undefined, 'broken code');
    expect(prompt).toContain('broken code');
  });
});

describe('buildRefactorPrompt', () => {
  it('should include refactor goal', () => {
    const ctx: Context = {
      files: [],
      cursor: { line: 1, column: 1 },
    };
    const prompt = buildRefactorPrompt(ctx, 'old code', 'improve readability');
    expect(prompt).toContain('improve readability');
  });
});

describe('buildCodeGeneratePrompt', () => {
  it('should include language', () => {
    const prompt = buildCodeGeneratePrompt('python', 'hello world');
    expect(prompt).toContain('python');
    expect(prompt).toContain('hello world');
  });
});

describe('buildGeneralQAPrompt', () => {
  it('should include message', () => {
    const prompt = buildGeneralQAPrompt('How do I use this?');
    expect(prompt).toContain('How do I use this?');
  });
});

describe('buildPrompt', () => {
  it('should build code explain prompt', () => {
    const ctx: Context = {
      files: [{ path: 'test.ts', language: 'typescript', content: 'test' }],
      cursor: { line: 1, column: 1 },
    };
    const prompt = buildPrompt('codeExplain', 'const x = 1;', ctx);
    expect(prompt).toContain(SYSTEM_PROMPTS.codeExplain);
    expect(prompt).toContain('const x = 1;');
  });

  it('should build bug fix prompt', () => {
    const ctx: Context = {
      files: [],
      cursor: { line: 1, column: 1 },
    };
    const prompt = buildPrompt('bugFix', 'buggy code', ctx);
    expect(prompt).toContain(SYSTEM_PROMPTS.bugFix);
  });

  it('should build code generate prompt', () => {
    const prompt = buildPrompt('codeGenerate', 'fetch data', undefined);
    expect(prompt).toContain(SYSTEM_PROMPTS.codeGenerate);
  });
});