/**
 * 配置服务
 */

import * as vscode from 'vscode';

/**
 * VSCode 配置服务
 */
export class ConfigService {
    
    /**
     * 获取 API Key
     */
    getApiKey(): string {
        return vscode.workspace.getConfiguration('vexCoding').get<string>('apiKey', '');
    }
    
    /**
     * 设置 API Key
     */
    setApiKey(key: string): void {
        vscode.workspace.getConfiguration('vexCoding').update('apiKey', key, true);
    }
    
    /**
     * 获取 API 端点
     */
    getApiEndpoint(): string {
        return vscode.workspace.getConfiguration('vexCoding').get<string>('apiEndpoint', 'https://token-plan-cn.xiaomimimo.com/v1');
    }
    
    /**
     * 设置 API 端点
     */
    setApiEndpoint(endpoint: string): void {
        vscode.workspace.getConfiguration('vexCoding').update('apiEndpoint', endpoint, true);
    }
    
    /**
     * 获取模型
     */
    getModel(): string {
        return vscode.workspace.getConfiguration('vexCoding').get<string>('model', 'mimo-pro');
    }
    
    /**
     * 获取最大 Token 数
     */
    getMaxTokens(): number {
        return vscode.workspace.getConfiguration('vexCoding').get<number>('maxTokens', 2048);
    }
    
    /**
     * 检查是否已配置
     */
    isConfigured(): boolean {
        return this.getApiKey().trim().length > 0;
    }
    
    /**
     * 验证配置
     */
    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (!this.getApiKey().trim()) {
            errors.push('API Key 未设置');
        }
        
        if (!this.getApiEndpoint().trim()) {
            errors.push('API 端点未设置');
        }
        
        if (this.getMaxTokens() <= 0) {
            errors.push('MaxTokens 必须大于 0');
        }
        
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}