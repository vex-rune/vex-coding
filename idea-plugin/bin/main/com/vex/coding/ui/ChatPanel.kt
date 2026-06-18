package com.vex.coding.ui

import com.intellij.openapi.project.Project
import com.vex.coding.config.ConfigService
import com.vex.coding.service.ContextService
import com.vex.coding.service.LLMService
import kotlinx.coroutines.*
import java.awt.BorderLayout
import java.awt.Dimension
import javax.swing.*

/**
 * 聊天面板
 */
class ChatPanel(private val project: Project) : JPanel() {
    
    private val llmService = LLMService()
    private val contextService = ContextService(project)
    private val config = ConfigService.getInstance()
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    private val messagesArea = JTextArea().apply {
        isEditable = false
        lineWrap = true
        wrapStyleWord = true
        border = BorderFactory.createEmptyBorder(10, 10, 10, 10)
    }
    
    private val inputField = JTextArea().apply {
        lineWrap = true
        wrapStyleWord = true
        minimumSize = Dimension(0, 60)
        maximumSize = Dimension(Integer.MAX_VALUE, 100)
    }
    
    private val sendButton = JButton("发送").apply {
        addActionListener { sendMessage() }
    }
    
    private val scrollPane = JScrollPane(messagesArea).apply {
        verticalScrollBarPolicy = JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED
    }
    
    init {
        layout = BorderLayout(10, 10)
        
        // 顶部标题
        add(JLabel("Vex Coding - AI 编程助手").apply {
            border = BorderFactory.createEmptyBorder(10, 10, 10, 10)
        }, BorderLayout.NORTH)
        
        // 消息区域
        add(scrollPane, BorderLayout.CENTER)
        
        // 底部输入区域
        val inputPanel = JPanel(BorderLayout(5, 5)).apply {
            border = BorderFactory.createEmptyBorder(10, 10, 10, 10)
            add(JScrollPane(inputField), BorderLayout.CENTER)
            add(sendButton, BorderLayout.EAST)
        }
        add(inputPanel, BorderLayout.SOUTH)
        
        // 欢迎消息
        appendMessage("assistant", "你好！我是 Vex Coding AI 助手。\n\n" +
            "我可以帮助你：\n" +
            "- 解释代码功能\n" +
            "- 诊断 Bug\n" +
            "- 重构建议\n" +
            "- 回答编程问题\n\n" +
            "请在下方输入你的问题。")
    }
    
    private fun sendMessage() {
        val message = inputField.text.trim()
        if (message.isBlank()) return
        
        inputField.text = ""
        appendMessage("user", message)
        
        if (!config.isConfigured()) {
            appendMessage("assistant", "请先在设置中配置 API Key")
            return
        }
        
        // 显示加载状态
        appendMessage("assistant", "思考中...")
        
        scope.launch {
            try {
                val context = contextService.buildContext()
                val response = withContext(Dispatchers.IO) {
                    llmService.chat(message, context)
                }
                
                // 移除加载消息
                messagesArea.text = messagesArea.text.substringBeforeLast("思考中...\n\n").trimEnd()
                
                appendMessage("assistant", response)
            } catch (e: Exception) {
                // 移除加载消息
                messagesArea.text = messagesArea.text.substringBeforeLast("思考中...\n\n").trimEnd()
                
                appendMessage("assistant", "错误: ${e.message}")
            }
        }
    }
    
    private fun appendMessage(role: String, content: String) {
        val prefix = when (role) {
            "user" -> "你:"
            "assistant" -> "AI:"
            else -> ""
        }
        
        messagesArea.append("$prefix $content\n\n")
        
        // 滚动到底部
        SwingUtilities.invokeLater {
            val lastPos = messagesArea.document.length
            messagesArea.caretPosition = lastPos
        }
    }
}