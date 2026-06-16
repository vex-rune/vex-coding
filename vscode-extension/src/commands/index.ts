/**
 * 命令注册
 */

import * as vscode from 'vscode';
import { AskCommand } from './ask.js';
import { ExplainCommand } from './explain.js';
import { ConfigService } from '../config/index.js';

/**
 * 注册所有命令
 */
export function registerCommands(context: vscode.ExtensionContext, config: ConfigService): void {
    // 智能问答命令
    const askCommand = new AskCommand(config);
    context.subscriptions.push(
        vscode.commands.registerCommand('vex-coding.ask', askCommand.execute, askCommand)
    );
    
    // 代码解释命令
    const explainCommand = new ExplainCommand(config);
    context.subscriptions.push(
        vscode.commands.registerCommand('vex-coding.explain', explainCommand.execute, explainCommand)
    );
}