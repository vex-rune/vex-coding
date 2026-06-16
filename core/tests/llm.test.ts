/**
 * LLM 客户端测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMClient } from '../src/llm/client.js';
import { LLMError, ErrorCode } from '../src/types/index.js';
import type { ChatRequest } from '../src/types/index.js';

describe('LLMClient', () => {
  let client: LLMClient;

  beforeEach(() => {
    client = new LLMClient({
      apiEndpoint: 'https://api.test.com',
      apiKey: 'test-key',
      model: 'test-model',
      maxTokens: 2048,
    });
  });

  describe('getConfig', () => {
    it('should return current config', () => {
      const config = client.getConfig();
      expect(config.apiKey).toBe('test-key');
      expect(config.model).toBe('test-model');
    });
  });

  describe('setConfig', () => {
    it('should update config', () => {
      client.setConfig({ model: 'new-model' });
      expect(client.getConfig().model).toBe('new-model');
    });

    it('should merge partial updates', () => {
      client.setConfig({ maxTokens: 4096 });
      expect(client.getConfig().maxTokens).toBe(4096);
      expect(client.getConfig().model).toBe('test-model');
    });
  });

  describe('chat', () => {
    it('should handle fetch error gracefully', async () => {
      vi.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.reject(new Error('Network error')),
      );

      const request: ChatRequest = {
        message: 'hello',
        context: { files: [], cursor: { line: 1, column: 1 } },
        history: [],
      };

      await expect(client.chat(request)).rejects.toThrow(LLMError);
    });

    it('should handle API error response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      } as unknown as Response);

      const request: ChatRequest = {
        message: 'hello',
        context: { files: [], cursor: { line: 1, column: 1 } },
        history: [],
      };

      await expect(client.chat(request)).rejects.toThrow(LLMError);
    });
  });

  describe('LLMError', () => {
    it('should have correct properties', () => {
      const error = new LLMError('Test error', ErrorCode.API_ERROR, 500);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.API_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('LLMError');
    });

    it('should support all error codes', () => {
      const codes = Object.values(ErrorCode);
      codes.forEach(code => {
        const error = new LLMError('test', code);
        expect(error.code).toBe(code);
      });
    });
  });
});