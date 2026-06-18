package com.vex.coding.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.Project
import com.vex.coding.ui.ChatToolWindowManager

/**
 * 打开问答面板 Action
 */
class AskAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        
        // 打开工具窗口
        ChatToolWindowManager.getInstance(project).showToolWindow()
    }
}