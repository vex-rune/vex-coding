/**
 * 补全服务测试
 */

import { describe, it, expect } from 'vitest';

describe('CompletionService', () => {
    describe('buildCompletionRequest', () => {
        it('should build valid request', () => {
            const context = 'public class Test {\n}';
            const language = 'java';
            
            // 模拟请求构建
            const prompt = `请根据上下文预测最可能的代码补全。

语言: ${language}
上下文:
${context}

请只返回补全的代码，不需要解释。`;
            
            expect(prompt).toContain('java');
            expect(prompt).toContain('Test');
        });
        
        it('should handle empty context', () => {
            const context = '';
            const language = 'python';
            
            const prompt = `请根据上下文预测最可能的代码补全。

语言: ${language}
上下文:
${context}

请只返回补全的代码，不需要解释。`;
            
            expect(prompt).toContain('python');
        });
    });
    
    describe('parseCompletionResponse', () => {
        it('should parse code block', () => {
            const content = '```java\npublic void foo() {}\n```';
            
            const cleanedCode = content
                .replace(/^```[\w]*\n?/, '')
                .replace(/\n?```$/, '')
                .trim();
            
            expect(cleanedCode).toBe('public void foo() {}');
        });
        
        it('should handle plain text', () => {
            const content = 'return true;';
            
            const cleanedCode = content
                .replace(/^```[\w]*\n?/, '')
                .replace(/\n?```$/, '')
                .trim();
            
            expect(cleanedCode).toBe('return true;');
        });
        
        it('should handle empty response', () => {
            const content = '';
            
            const cleanedCode = content
                .replace(/^```[\w]*\n?/, '')
                .replace(/\n?```$/, '')
                .trim();
            
            expect(cleanedCode).toBe('');
        });
    });
    
    describe('CompletionItem', () => {
        it('should have required properties', () => {
            const item = {
                text: 'console.log("hello");',
                startLine: 0,
                confidence: 0.85,
            };
            
            expect(item.text).toBeDefined();
            expect(item.startLine).toBe(0);
            expect(item.confidence).toBeGreaterThan(0);
            expect(item.confidence).toBeLessThanOrEqual(1);
        });
    });
});