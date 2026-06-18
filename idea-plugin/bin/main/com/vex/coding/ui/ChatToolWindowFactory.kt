package com.vex.coding.ui

import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory

/**
 * 聊天工具窗口工厂
 */
class ChatToolWindowFactory : ToolWindowFactory {
    
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val contentPanel = ChatPanel(project)
        val content = ContentFactory.getInstance()
            .createContent(contentPanel, "", false)
        
        toolWindow.contentManager.addContent(content)
    }
}