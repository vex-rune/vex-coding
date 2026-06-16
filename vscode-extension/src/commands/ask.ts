/**
 * 智能问答命令
 */

import * as vscode from 'vscode';
import { ConfigService } from '../config/index.js';

/**
 * 智能问答命令
 */
export class AskCommand {
    
    constructor(private config: ConfigService) {}
    
    /**
     * 执行命令
     */
    execute(): void {
        if (!this.config.isConfigured()) {
            vscode.window.showErrorMessage('请先在设置中配置 Vex Coding API Key');
            vscode.commands.executeCommand('workbench.action.openSettings', 'vexCoding.apiKey');
            return;
        }
        
        // 显示输入框
        vscode.window.showInputBox({
            prompt: '输入你的问题',
            placeHolder: '例如：如何实现一个排序算法？',
        }).then(async (question) => {
            if (!question?.trim()) {
                return;
            }
            
            // 显示进度
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Vex Coding',
                    cancellable: false,
                },
                async (progress) => {
                    progress.report({ message: 'AI 正在思考...' });
                    
                    try {
                        const { LLMService } = await import('../service/LLMService.js');
                        const { ContextService } = await import('../service/ContextService.js');
                        
                        const llmService = new LLMService(this.config);
                        const contextService = new ContextService();
                        
                        const context = contextService.buildContext();
                        const response = await llmService.chat(question, context);
                        
                        // 显示响应
                        vscode.window.showInformationMessage('AI 回复', '查看详情').then(() => {
                            vscode.env.clipboard.writeText(response);
                            vscode.window.showInformationMessage('回复已复制到剪贴板');
                        });
                    } catch (error) {
                        const message = error instanceof Error ? error.message : '未知错误';
                        vscode.window.showErrorMessage(`错误: ${message}`);
                    }
                }
            );
        });
    }
}