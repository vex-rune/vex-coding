package com.vex.coding.ui

import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Splitter
import com.vex.coding.config.ConfigService
import com.vex.coding.service.ContextService
import com.vex.coding.service.LLMService
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import kotlinx.coroutines.*
import java.awt.*
import java.awt.event.KeyAdapter
import java.awt.event.KeyEvent
import javax.swing.*
import javax.swing.border.EmptyBorder

/**
 * 聊天面板 UI
 */
class ChatPanel(private val project: Project) : JPanel() {
    
    private val llmService = LLMService()
    private val contextService = ContextService(project)
    private val config = ConfigService.getInstance()
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    // 消息列表模型
    private val messagesModel = DefaultListModel<String>()
    private val messagesList = JList<String>(messagesModel).apply {
        cellRenderer = MessageCellRenderer()
        background = UIUtil.getTextFieldBackground()
        border = null
    }
    
    // 输入区域
    private val inputArea = JTextArea().apply {
        rows = 3
        lineWrap = true
        wrapStyleWord = true
        font = Font("Microsoft YaHei", Font.PLAIN, 14)
        putClientProperty("JTextArea.styleName", "TextArea")
        border = BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(UIUtil.getBoundsColor()),
            EmptyBorder(8, 8, 8, 8)
        )
        
        // 回车发送，Shift+回车换行
        addKeyListener(object : KeyAdapter() {
            override fun keyPressed(e: KeyEvent) {
                if (e.keyCode == KeyEvent.VK_ENTER && !e.isShiftDown) {
                    e.consume()
                    sendMessage()
                }
            }
        })
    }
    
    private val sendButton = JButton("发送").apply {
        font = Font("Microsoft YaHei", Font.BOLD, 13)
        background = Color(66, 133, 244)
        foreground = Color.WHITE
        border = BorderFactory.createEmptyBorder(10, 20, 10, 20)
        isOpaque = true
        cursor = Cursor.getPredefinedCursor(Cursor.HAND_CURSOR)
        
        addActionListener { sendMessage() }
    }
    
    private val clearButton = JButton("清空").apply {
        font = Font("Microsoft YaHei", Font.PLAIN, 12)
        foreground = UIUtil.getContextHelpForeground()
        
        addActionListener { clearMessages() }
    }
    
    // 状态标签
    private val statusLabel = JLabel().apply {
        text = "就绪"
        font = Font("Microsoft YaHei", Font.PLAIN, 11)
        foreground = UIUtil.getContextHelpForeground()
    }
    
    init {
        layout = BorderLayout(0, 0)
        background = UIUtil.getTextFieldBackground()
        
        // 顶部标题栏
        add(createHeader(), BorderLayout.NORTH)
        
        // 消息区域
        val scrollPane = JScrollPane(messagesList).apply {
            verticalScrollBarPolicy = JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED
            border = null
            background = UIUtil.getTextFieldBackground()
        }
        add(scrollPane, BorderLayout.CENTER)
        
        // 底部输入区域
        add(createFooter(), BorderLayout.SOUTH)
        
        // 欢迎消息
        showWelcome()
    }
    
    private fun createHeader(): JPanel {
        return JPanel(BorderLayout(10, 0)).apply {
            background = Color(248, 249, 250)
            border = BorderFactory.createMatteBorder(0, 0, 1, 0, UIUtil.getBoundsColor())
            preferredSize = Dimension(0, 50)
            
            // 标题
            add(JLabel("Vex Coding AI 助手").apply {
                font = Font("Microsoft YaHei", Font.BOLD, 14)
                border = EmptyBorder(0, 15, 0, 0)
            }, BorderLayout.WEST)
            
            // 快捷操作
            val actionsPanel = JPanel(FlowLayout(FlowLayout.RIGHT, 10, 10)).apply {
                background = Color(248, 249, 250)
                
                add(JButton("清空").apply {
                    font = Font("Microsoft YaHei", Font.PLAIN, 12)
                    isContentAreaFilled = false
                    border = null
                    addActionListener { clearMessages() }
                })
                
                add(JButton("解释代码").apply {
                    font = Font("Microsoft YaHei", Font.PLAIN, 12)
                    isContentAreaFilled = false
                    border = null
                    addActionListener { explainSelection() }
                })
            }
            add(actionsPanel, BorderLayout.EAST)
        }
    }
    
    private fun createFooter(): JPanel {
        return JPanel(BorderLayout(10, 10)).apply {
            background = UIUtil.getTextFieldBackground()
            border = BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(1, 0, 0, 0, UIUtil.getBoundsColor()),
                EmptyBorder(10, 15, 10, 15)
            )
            
            // 输入区域
            val inputScrollPane = JScrollPane(inputArea).apply {
                verticalScrollBarPolicy = JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED
                border = null
            }
            add(inputScrollPane, BorderLayout.CENTER)
            
            // 发送按钮
            add(sendButton, BorderLayout.EAST)
        }
    }
    
    private fun showWelcome() {
        val welcome = """
            <div style='font-family: Microsoft YaHei; padding: 20px;'>
                <h2 style='color: #4285f4;'>👋 你好，我是 Vex Coding</h2>
                <p>我可以帮助你：</p>
                <ul>
                    <li>🔍 解释代码功能</li>
                    <li>🐛 诊断 Bug 原因</li>
                    <li>♻️ 提供重构建议</li>
                    <li>💡 回答编程问题</li>
                    <li>📝 生成代码片段</li>
                </ul>
                <p style='color: #666; font-size: 12px;'>💡 提示：选中代码后点击「解释代码」可获得更好的回答</p>
            </div>
        """.trimIndent()
        
        messagesModel.addElement("<html>$welcome</html>")
    }
    
    private fun sendMessage() {
        val message = inputArea.text.trim()
        if (message.isBlank()) return
        
        inputArea.text = ""
        
        // 添加用户消息
        addUserMessage(message)
        
        // 检查配置
        if (!config.isConfigured()) {
            addErrorMessage("⚠️ 请先在「设置 → Vex Coding」中配置 API Key")
            return
        }
        
        // 显示加载状态
        val loadingId = addLoadingMessage()
        
        scope.launch {
            try {
                val context = contextService.buildContext()
                val response = withContext(Dispatchers.IO) {
                    llmService.chat(message, context)
                }
                
                // 移除加载消息，添加响应
                removeMessage(loadingId)
                addAssistantMessage(response)
                statusLabel.text = "就绪"
            } catch (e: Exception) {
                removeMessage(loadingId)
                addErrorMessage("❌ 错误: ${e.message}")
                statusLabel.text = "错误"
            }
        }
    }
    
    private fun addUserMessage(message: String): Int {
        val html = """
            <div style='background: #e8f0fe; padding: 12px; border-radius: 12px; margin: 8px 0;'>
                <div style='color: #1a73e8; font-weight: bold; margin-bottom: 4px;'>👤 你</div>
                <div style='font-family: Microsoft YaHei;'>${message.replace("\n", "<br>")}</div>
            </div>
        """.trimIndent()
        messagesModel.addElement("<html>$html</html>")
        scrollToBottom()
        return messagesModel.size() - 1
    }
    
    private fun addAssistantMessage(message: String): Int {
        val html = """
            <div style='background: #f8f9fa; padding: 12px; border-radius: 12px; margin: 8px 0;'>
                <div style='color: #34a853; font-weight: bold; margin-bottom: 4px;'>🤖 Vex Coding</div>
                <div style='font-family: Microsoft YaHei; white-space: pre-wrap;'>${message.replace("\n", "<br>")}</div>
            </div>
        """.trimIndent()
        messagesModel.addElement("<html>$html</html>")
        scrollToBottom()
        return messagesModel.size() - 1
    }
    
    private fun addErrorMessage(message: String): Int {
        val html = """
            <div style='background: #fce8e6; padding: 12px; border-radius: 12px; margin: 8px 0; border-left: 4px solid #ea4335;'>
                <div style='font-family: Microsoft YaHei;'>${message}</div>
            </div>
        """.trimIndent()
        messagesModel.addElement("<html>$html</html>")
        scrollToBottom()
        return messagesModel.size() - 1
    }
    
    private fun addLoadingMessage(): Int {
        val html = """
            <div style='background: #f8f9fa; padding: 12px; border-radius: 12px; margin: 8px 0;'>
                <div style='color: #666; font-family: Microsoft YaHei;'>⏳ 正在思考...</div>
            </div>
        """.trimIndent()
        messagesModel.addElement("<html>$html</html>")
        scrollToBottom()
        return messagesModel.size() - 1
    }
    
    private fun removeMessage(index: Int) {
        if (index >= 0 && index < messagesModel.size()) {
            messagesModel.remove(index)
        }
    }
    
    private fun clearMessages() {
        messagesModel.clear()
        showWelcome()
    }
    
    private fun explainSelection() {
        val editor = com.intellij.openapi.editor.EditorFactory.getInstance().allEditors
            .filterIsInstance<com.intellij.openapi.editor.ex.EditorEx>()
            .firstOrNull { it.project == project }
        
        if (editor != null && editor.selectionModel.hasSelection()) {
            val selectedText = editor.selectionModel.selectedText
            if (!selectedText.isNullOrBlank()) {
                inputArea.text = "请解释以下代码：\n$selectedText"
                inputArea.requestFocus()
            }
        } else {
            addErrorMessage("请先选中要解释的代码")
        }
    }
    
    private fun scrollToBottom() {
        SwingUtilities.invokeLater {
            if (messagesList.model.size > 0) {
                messagesList.ensureIndexIsVisible(messagesList.model.size - 1)
            }
        }
    }
    
    /**
     * 消息单元格渲染器
     */
    inner class MessageCellRenderer : ListCellRenderer<String> {
        override fun getListCellRendererComponent(
            list: JList<out String>,
            value: String?,
            index: Int,
            isSelected: Boolean,
            cellHasFocus: Boolean
        ): Component {
            return JEditorPane("text/html", value).apply {
                isEditable = false
                background = UIUtil.getTextFieldBackground()
                border = null
                isOpaque = true
            }
        }
    }
}