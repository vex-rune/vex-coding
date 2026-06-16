/**
 * 代码补全服务
 */

import * as vscode from 'vscode';
import { ConfigService } from '../config/index.js';
import { ContextService } from './ContextService.js';

/**
 * 补全项
 */
interface CompletionItem {
    text: string;
    startLine: number;
    confidence: number;
}

/**
 * 代码补全提供者
 */
export class CompletionProvider implements vscode.InlineCompletionItemProvider {
    
    private config: ConfigService;
    private contextService: ContextService;
    
    constructor(config: ConfigService) {
        this.config = config;
        this.contextService = new ContextService();
    }
    
    /**
     * 提供行内补全
     */
    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionList | vscode.InlineCompletionItem[]> {
        if (!this.config.isConfigured()) {
            return [];
        }
        
        try {
            // 获取当前行之前的上下文
            const startLine = Math.max(0, position.line - 20);
            const range = new vscode.Range(startLine, 0, position.line, position.character);
            const contextText = document.getText(range);
            
            // 调用 LLM 获取补全
            const completions = await this.getCompletions(contextText, document.languageId);
            
            return completions.map(c => new vscode.InlineCompletionItem(
                c.text,
                new vscode.Range(position, position)
            ));
        } catch {
            return [];
        }
    }
    
    /**
     * 获取补全
     */
    private async getCompletions(context: string, language: string): Promise<CompletionItem[]> {
        const prompt = `请根据上下文预测最可能的代码补全。

语言: ${language}
上下文:
${context}

请只返回补全的代码，不需要解释。`;
        
        const response = await fetch(`${this.config.getApiEndpoint()}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.getApiKey()}`,
            },
            body: JSON.stringify({
                model: this.config.getModel(),
                messages: [
                    { role: 'system', content: '你是一个代码补全助手，只返回补全代码，不做解释。' },
                    { role: 'user', content: prompt },
                ],
                max_tokens: 256,
                temperature: 0.3,
            }),
        });
        
        if (!response.ok) {
            return [];
        }
        
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
            return [];
        }
        
        // 清理代码（移除 markdown 代码块标记）
        const cleanedCode = content
            .replace(/^```[\w]*\n?/, '')
            .replace(/\n?```$/, '')
            .trim();
        
        if (!cleanedCode) {
            return [];
        }
        
        return [{
            text: cleanedCode,
            startLine: 0,
            confidence: 0.85,
        }];
    }
}