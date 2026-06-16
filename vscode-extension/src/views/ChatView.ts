/**
 * 聊天视图
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigService } from '../config/index.js';
import { ContextService, Context } from '../service/ContextService.js';
import { LLMService } from '../service/LLMService.js';

/**
 * 聊天视图提供者
 */
export class ChatViewProvider implements vscode.WebviewViewProvider {
    
    private webview?: vscode.Webview;
    private messages: Array<{ role: string; content: string }> = [];
    
    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly config: ConfigService
    ) {}
    
    /**
     * 解析 WebView
     */
    resolveWebviewView(webviewView: vscode.WebviewView): void {
        this.webview = webviewView.webview;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };
        
        webviewView.webview.html = this.getHtml();
        
        // 处理消息
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'send':
                    await this.handleSend(message.text);
                    break;
                case 'clear':
                    this.messages = [];
                    this.sendUpdate();
                    break;
            }
        });
    }
    
    /**
     * 处理发送消息
     */
    private async handleSend(text: string): Promise<void> {
        if (!text.trim()) {
            return;
        }
        
        if (!this.config.isConfigured()) {
            this.webview?.postMessage({
                command: 'error',
                text: '请先配置 API Key',
            });
            return;
        }
        
        // 添加用户消息
        this.messages.push({ role: 'user', content: text });
        this.sendUpdate();
        
        try {
            const llmService = new LLMService(this.config);
            const contextService = new ContextService();
            const context = contextService.buildContext();
            
            const response = await llmService.chat(text, context);
            
            // 添加助手消息
            this.messages.push({ role: 'assistant', content: response });
            this.sendUpdate();
        } catch (error) {
            const message = error instanceof Error ? error.message : '未知错误';
            this.webview?.postMessage({
                command: 'error',
                text: message,
            });
        }
    }
    
    /**
     * 发送更新
     */
    private sendUpdate(): void {
        this.webview?.postMessage({
            command: 'update',
            messages: this.messages,
        });
    }
    
    /**
     * 获取 HTML
     */
    private getHtml(): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: system-ui;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                    }
                    .messages {
                        flex: 1;
                        overflow-y: auto;
                        padding: 10px;
                    }
                    .message {
                        margin-bottom: 10px;
                        padding: 8px 12px;
                        border-radius: 5px;
                    }
                    .message.user {
                        background: #e3f2fd;
                        margin-left: 20px;
                    }
                    .message.assistant {
                        background: #f5f5f5;
                        margin-right: 20px;
                    }
                    .input-area {
                        display: flex;
                        padding: 10px;
                        border-top: 1px solid #ddd;
                    }
                    textarea {
                        flex: 1;
                        resize: none;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        min-height: 60px;
                    }
                    button {
                        margin-left: 10px;
                        padding: 8px 16px;
                        background: #0066cc;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    button:hover {
                        background: #0052a3;
                    }
                </style>
            </head>
            <body>
                <div class="messages" id="messages"></div>
                <div class="input-area">
                    <textarea id="input" placeholder="输入你的问题..."></textarea>
                    <button id="send">发送</button>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const messagesDiv = document.getElementById('messages');
                    const input = document.getElementById('input');
                    const sendBtn = document.getElementById('send');
                    
                    function renderMessages(messages) {
                        messagesDiv.innerHTML = messages.map(m => 
                            '<div class="message ' + m.role + '">' + m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>') + '</div>'
                        ).join('');
                        messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    }
                    
                    function send() {
                        const text = input.value.trim();
                        if (!text) return;
                        input.value = '';
                        vscode.postMessage({ command: 'send', text });
                    }
                    
                    sendBtn.addEventListener('click', send);
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            send();
                        }
                    });
                    
                    window.addEventListener('message', (event) => {
                        const message = event.data;
                        if (message.command === 'update') {
                            renderMessages(message.messages);
                        } else if (message.command === 'error') {
                            alert('错误: ' + message.text);
                        }
                    });
                    
                    // 初始欢迎消息
                    renderMessages([{
                        role: 'assistant',
                        content: '你好！我是 Vex Coding AI 助手。\\n\\n我可以帮助你：\\n- 解释代码功能\\n- 诊断 Bug\\n- 重构建议\\n- 回答编程问题\\n\\n请在下方输入你的问题。'
                    }]);
                </script>
            </body>
            </html>
        `;
    }
}