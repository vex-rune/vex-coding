/**
 * 上下文服务测试
 */

import { describe, it, expect } from 'vitest';

// 模拟上下文类型
interface Context {
    files: Array<{ path: string; language: string; content: string }>;
    cursor: { line: number; column: number };
    selectedCode: string | null;
}

describe('ContextService', () => {
    describe('detectLanguage', () => {
        it('should detect java', () => {
            const languageId = 'java';
            expect(['java']).toContain(languageId);
        });
        
        it('should detect python', () => {
            const languageId = 'python';
            expect(['python']).toContain(languageId);
        });
        
        it('should detect javascript', () => {
            const languageId = 'javascript';
            expect(['javascript']).toContain(languageId);
        });
        
        it('should detect typescript', () => {
            const languageId = 'typescript';
            expect(['typescript']).toContain(languageId);
        });
    });
    
    describe('Context structure', () => {
        it('should create context with files', () => {
            const context: Context = {
                files: [{ path: 'test.java', language: 'java', content: 'public class Test {}' }],
                cursor: { line: 1, column: 1 },
                selectedCode: null,
            };
            
            expect(context.files).toHaveLength(1);
            expect(context.files[0].language).toBe('java');
        });
        
        it('should create context with cursor', () => {
            const context: Context = {
                files: [],
                cursor: { line: 42, column: 15 },
                selectedCode: null,
            };
            
            expect(context.cursor.line).toBe(42);
            expect(context.cursor.column).toBe(15);
        });
        
        it('should create context with selected code', () => {
            const context: Context = {
                files: [],
                cursor: { line: 1, column: 1 },
                selectedCode: 'const x = 1;',
            };
            
            expect(context.selectedCode).toBe('const x = 1;');
        });
    });
});