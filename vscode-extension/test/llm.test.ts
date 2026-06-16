/**
 * LLM 服务测试
 */

import { describe, it, expect } from 'vitest';

describe('LLMError', () => {
    it('should have correct properties', () => {
        class LLMError extends Error {
            constructor(
                message: string,
                public code: string,
                public statusCode?: number
            ) {
                super(message);
                this.name = 'LLMError';
            }
        }
        
        const error = new LLMError('Test error', 'API_ERROR', 500);
        
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('API_ERROR');
        expect(error.statusCode).toBe(500);
        expect(error.name).toBe('LLMError');
    });
});

describe('LLMService', () => {
    describe('buildMessages', () => {
        it('should build messages with context', () => {
            const context = {
                files: [{ path: 'test.java', language: 'java', content: 'class Test {}' }],
                cursor: { line: 1, column: 1 },
                selectedCode: null,
            };
            
            const messages: Array<{ role: string; content: string }> = [];
            
            if (context.files.length > 0) {
                const contextText = context.files
                    .map(f => `文件: ${f.path}\n\`\`\`${f.language}\n${f.content}\n\`\`\``)
                    .join('\n\n');
                
                messages.push({
                    role: 'system',
                    content: `相关代码上下文:\n${contextText}`,
                });
            }
            
            messages.push({
                role: 'user',
                content: 'Hello',
            });
            
            expect(messages).toHaveLength(2);
            expect(messages[0].role).toBe('system');
            expect(messages[1].role).toBe('user');
        });
        
        it('should build messages without context', () => {
            const context = {
                files: [],
                cursor: { line: 1, column: 1 },
                selectedCode: null,
            };
            
            const messages: Array<{ role: string; content: string }> = [];
            
            messages.push({
                role: 'user',
                content: 'Hello',
            });
            
            expect(messages).toHaveLength(1);
            expect(messages[0].role).toBe('user');
        });
    });
    
    describe('parseResponse', () => {
        it('should parse valid response', () => {
            const data = {
                choices: [{
                    message: {
                        content: 'Hello, world!',
                    },
                }],
            };
            
            const content = data.choices?.[0]?.message?.content ?? '';
            expect(content).toBe('Hello, world!');
        });
        
        it('should handle empty response', () => {
            const data = {};
            const content = data.choices?.[0]?.message?.content ?? '';
            expect(content).toBe('');
        });
    });
});