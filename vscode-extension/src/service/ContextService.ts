/**
 * 上下文服务
 */

import * as vscode from 'vscode';

/**
 * 上下文信息
 */
export interface Context {
    files: FileContext[];
    cursor: CursorPosition;
    selectedCode: string | null;
}

export interface FileContext {
    path: string;
    language: string;
    content: string;
}

export interface CursorPosition {
    line: number;
    column: number;
}

/**
 * 上下文服务
 */
export class ContextService {
    
    /**
     * 提取当前文件上下文
     */
    extractCurrentFile(): FileContext | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }
        
        const document = editor.document;
        
        return {
            path: document.uri.fsPath,
            language: this.detectLanguage(document.languageId),
            content: document.getText(),
        };
    }
    
    /**
     * 提取光标位置
     */
    extractCursor(): CursorPosition {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { line: 1, column: 1 };
        }
        
        const position = editor.selection.active;
        return {
            line: position.line + 1,
            column: position.character + 1,
        };
    }
    
    /**
     * 提取选中的代码
     */
    extractSelection(): string | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }
        
        const selection = editor.selection;
        if (selection.isEmpty) {
            return null;
        }
        
        return editor.document.getText(selection);
    }
    
    /**
     * 构建完整上下文
     */
    buildContext(): Context {
        const files: FileContext[] = [];
        
        const currentFile = this.extractCurrentFile();
        if (currentFile) {
            files.push(currentFile);
        }
        
        return {
            files,
            cursor: this.extractCursor(),
            selectedCode: this.extractSelection(),
        };
    }
    
    /**
     * 检测语言
     */
    private detectLanguage(languageId: string): string {
        const languageMap: Record<string, string> = {
            java: 'java',
            kotlin: 'kotlin',
            python: 'python',
            javascript: 'javascript',
            typescript: 'typescript',
            rust: 'rust',
            go: 'go',
            'c#': 'csharp',
            cpp: 'cpp',
            html: 'html',
            css: 'css',
            json: 'json',
            xml: 'xml',
            markdown: 'markdown',
            sql: 'sql',
        };
        
        return languageMap[languageId.toLowerCase()] ?? 'plaintext';
    }
}