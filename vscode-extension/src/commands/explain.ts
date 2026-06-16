/**
 * 代码解释命令
 */

import * as vscode from 'vscode';
import { ConfigService } from '../config/index.js';

/**
 * 代码解释命令
 */
export class ExplainCommand {
    
    constructor(private config: ConfigService) {}
    
    /**
     * 执行命令
     */
    async execute(): Promise<void> {
        if (!this.config.isConfigured()) {
            vscode.window.showErrorMessage('请先在设置中配置 Vex Coding API Key');
            return;
        }
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('请先打开一个文件');
            return;
        }
        
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('请先选中要解释的代码');
            return;
        }
        
        const selectedCode = editor.document.getText(selection);
        
        // 显示进度
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Vex Coding',
                cancellable: false,
            },
            async (progress) => {
                progress.report({ message: 'AI 正在分析代码...' });
                
                try {
                    const { LLMService } = await import('../service/LLMService.js');
                    const { ContextService } = await import('../service/ContextService.js');
                    
                    const llmService = new LLMService(this.config);
                    const contextService = new ContextService();
                    
                    const context = contextService.buildContext();
                    const prompt = `请解释以下代码：\n${selectedCode}`;
                    const response = await llmService.chat(prompt, context);
                    
                    // 显示解释结果
                    const doc = await vscode.workspace.openDocument(
                        editor.document.uri
                    );
                    await vscode.window.showTextDocument(doc, {
                        viewColumn: vscode.ViewColumn.Two,
                        preserveFocus: true,
                    });
                    
                    const explanationPanel = vscode.window.createWebviewPanel(
                        'vexCoding.explain',
                        '代码解释',
                        vscode.ViewColumn.Two,
                        {}
                    );
                    
                    explanationPanel.webview.html = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: system-ui; padding: 20px; }
                                pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
                                .explanation { white-space: pre-wrap; }
                            </style>
                        </head>
                        <body>
                            <h2>选中的代码：</h2>
                            <pre>${this.escapeHtml(selectedCode)}</pre>
                            <h2>AI 解释：</h2>
                            <div class="explanation">${this.escapeHtml(response)}</div>
                        </body>
                        </html>
                    `;
                } catch (error) {
                    const message = error instanceof Error ? error.message : '未知错误';
                    vscode.window.showErrorMessage(`错误: ${message}`);
                }
            }
        );
    }
    
    /**
     * HTML 转义
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}