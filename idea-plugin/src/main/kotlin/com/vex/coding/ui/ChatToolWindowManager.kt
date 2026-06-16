package com.vex.coding.ui

import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindowManager

/**
 * 工具窗口管理器
 */
class ChatToolWindowManager(private val project: Project) {
    
    companion object {
        const val TOOL_WINDOW_ID = "Vex Coding"
        
        fun getInstance(project: Project): ChatToolWindowManager {
            return ChatToolWindowManager(project)
        }
    }
    
    fun showToolWindow() {
        val toolWindow = ToolWindowManager.getInstance(project)
            .getToolWindow(TOOL_WINDOW_ID)
        
        toolWindow?.show()
    }
    
    fun hideToolWindow() {
        val toolWindow = ToolWindowManager.getInstance(project)
            .getToolWindow(TOOL_WINDOW_ID)
        
        toolWindow?.hide()
    }
}