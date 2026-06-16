package com.vex.coding.ui

import com.intellij.openapi.project.Project
import com.vex.coding.service.ContextService
import com.vex.coding.service.LLMService
import kotlinx.coroutines.*
import java.awt.Dimension
import javax.swing.*

/**
 * 代码解释弹窗
 */
class ExplainPopup(
    private val project: Project,
    private val selectedCode: String
) : JDialog() {
    
    private val llmService = LLMService()
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    private val contentArea = JTextArea().apply {
        isEditable = false
        lineWrap = true
        wrapStyleWord = true
    }
    
    private val scrollPane = JScrollPane(contentArea)
    
    init {
        title = "AI 代码解释"
        modal = false
        setLocationRelativeTo(null)
        
        contentPane.layout = java.awt.BorderLayout()
        contentPane.add(scrollPane, java.awt.BorderLayout.CENTER)
        
        val closeButton = JButton("关闭").apply {
            addActionListener { dispose() }
        }
        
        val buttonPanel = JPanel()
        buttonPanel.add(closeButton)
        contentPane.add(buttonPanel, java.awt.BorderLayout.SOUTH)
        
        setSize(Dimension(600, 400))
        
        // 加载解释
        loadExplanation()
    }
    
    companion object {
        fun show(project: Project, selectedCode: String) {
            val popup = ExplainPopup(project, selectedCode)
            popup.isVisible = true
        }
    }
    
    private fun loadExplanation() {
        contentArea.text = "正在分析代码..."
        
        scope.launch {
            try {
                val contextService = ContextService(project)
                val context = contextService.buildContext()
                
                val response = withContext(Dispatchers.IO) {
                    llmService.chat("请解释以下代码：\n$selectedCode", context)
                }
                
                contentArea.text = response
            } catch (e: Exception) {
                contentArea.text = "错误: ${e.message}"
            }
        }
    }
}