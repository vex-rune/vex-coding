/**
 * 配置管理测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigStore, getConfigStore, resetConfigStore } from '../src/config/store.js';
import { DEFAULT_LLM_CONFIG } from '../src/types/index.js';

describe('ConfigStore', () => {
  let store: ConfigStore;

  beforeEach(() => {
    resetConfigStore();
    store = new ConfigStore();
  });

  describe('getLLM', () => {
    it('should return default config initially', () => {
      const config = store.getLLM();
      expect(config.apiEndpoint).toBe(DEFAULT_LLM_CONFIG.apiEndpoint);
      expect(config.model).toBe(DEFAULT_LLM_CONFIG.model);
      expect(config.maxTokens).toBe(DEFAULT_LLM_CONFIG.maxTokens);
    });
  });

  describe('setLLM', () => {
    it('should update partial config', () => {
      store.setLLM({ apiKey: 'test-key' });
      const config = store.getLLM();
      expect(config.apiKey).toBe('test-key');
      expect(config.model).toBe(DEFAULT_LLM_CONFIG.model);
    });

    it('should merge multiple updates', () => {
      store.setLLM({ model: 'gpt-4' });
      store.setLLM({ maxTokens: 4096 });
      const config = store.getLLM();
      expect(config.model).toBe('gpt-4');
      expect(config.maxTokens).toBe(4096);
    });
  });

  describe('getApiKey / setApiKey', () => {
    it('should get and set API key', () => {
      store.setApiKey('my-secret-key');
      expect(store.getApiKey()).toBe('my-secret-key');
    });
  });

  describe('validate', () => {
    it('should fail when API key is empty', () => {
      const result = store.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('API Key 未设置');
    });

    it('should pass with valid config', () => {
      store.setApiKey('valid-key');
      const result = store.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when maxTokens is invalid', () => {
      store.setApiKey('valid-key');
      store.setLLM({ maxTokens: -1 });
      const result = store.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('MaxTokens 必须大于 0');
    });
  });
});

describe('getConfigStore', () => {
  it('should return singleton instance', () => {
    const store1 = getConfigStore();
    const store2 = getConfigStore();
    expect(store1).toBe(store2);
  });
});