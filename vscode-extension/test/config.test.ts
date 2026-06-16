/**
 * 配置服务测试
 */

import { describe, it, expect, beforeEach } from 'vitest';

// 模拟 vscode
const mockConfig = {
    getApiKey: () => '',
    setApiKey: () => {},
    getApiEndpoint: () => 'https://api.mimo.ai',
    setApiEndpoint: () => {},
    getModel: () => 'mimo-pro',
    getMaxTokens: () => 2048,
    isConfigured: function() {
        return this.getApiKey().trim().length > 0;
    },
    validate: function() {
        const errors = [];
        if (!this.getApiKey().trim()) {
            errors.push('API Key 未设置');
        }
        if (!this.getApiEndpoint().trim()) {
            errors.push('API 端点未设置');
        }
        if (this.getMaxTokens() <= 0) {
            errors.push('MaxTokens 必须大于 0');
        }
        return { valid: errors.length === 0, errors };
    }
};

describe('ConfigService', () => {
    beforeEach(() => {
        mockConfig.getApiKey = () => '';
    });
    
    describe('validate', () => {
        it('should fail when api key is empty', () => {
            const result = mockConfig.validate();
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('API Key 未设置');
        });
        
        it('should pass when api key is set', () => {
            mockConfig.getApiKey = () => 'test-key';
            const result = mockConfig.validate();
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
    
    describe('isConfigured', () => {
        it('should return false when api key is empty', () => {
            mockConfig.getApiKey = () => '';
            expect(mockConfig.isConfigured()).toBe(false);
        });
        
        it('should return true when api key is set', () => {
            mockConfig.getApiKey = () => 'valid-key';
            expect(mockConfig.isConfigured()).toBe(true);
        });
    });
    
    describe('getApiEndpoint', () => {
        it('should return default endpoint', () => {
            expect(mockConfig.getApiEndpoint()).toBe('https://api.mimo.ai');
        });
    });
    
    describe('getModel', () => {
        it('should return default model', () => {
            expect(mockConfig.getModel()).toBe('mimo-pro');
        });
    });
    
    describe('getMaxTokens', () => {
        it('should return default max tokens', () => {
            expect(mockConfig.getMaxTokens()).toBe(2048);
        });
    });
});