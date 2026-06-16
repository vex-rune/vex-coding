/**
 * Vex Coding VSCode 插件入口
 */

import * as vscode from 'vscode';
import { registerCommands } from './commands/index.js';
import { ChatViewProvider } from './views/ChatView.js';
import { ConfigService } from './config/index.js';

export function activate(context: vscode.ExtensionContext) {
    // 初始化配置
    const configService = new ConfigService();
    
    // 注册命令
    registerCommands(context, configService);
    
    // 注册 WebView 视图
    const chatViewProvider = new ChatViewProvider(context.extensionUri, configService);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('vex-coding-view', chatViewProvider)
    );
    
    // 显示欢迎消息
    vscode.window.showInformationMessage('Vex Coding 插件已激活！按 Alt+Shift+L 打开智能问答');
}

export function deactivate() {
    // 清理资源
}