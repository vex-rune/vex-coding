package com.vex.coding.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.Project
import com.vex.coding.service.ContextService
import com.vex.coding.ui.ExplainPopup

/**
 * AI 代码解释 Action
 */
class ExplainAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        
        val contextService = ContextService(project)
        val selectedCode = contextService.extractSelection()
        
        if (selectedCode.isNullOrBlank()) {
            return
        }
        
        // 显示解释弹窗
        ExplainPopup.show(project, selectedCode)
    }
}