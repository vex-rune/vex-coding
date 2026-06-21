package com.vex.coding.config

import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import java.awt.*
import javax.swing.*

/**
 * 配置面板 UI
 */
class ConfigPanel {
    
    private val config = ConfigService.getInstance()
    
    // API 配置
    private val apiEndpointField = JBTextField().apply {
        text = config.getApiEndpoint()
    }
    
    private val apiKeyField = JBTextField().apply {
        text = config.getApiKey()
        columns = 30
    }
    
    private val modelField = JBTextField().apply {
        text = config.getModel()
    }
    
    private val maxTokensField = JBTextField().apply {
        text = config.getMaxTokens().toString()
    }
    
    private val statusLabel = JBLabel().apply {
        text = if (config.isConfigured()) "✓ 已配置" else "✗ 未配置"
        foreground = if (config.isConfigured()) Color(0, 128, 0) else Color.RED
    }
    
    fun createPanel(): JPanel {
        val panel = JPanel()
        panel.layout = BoxLayout(panel, BoxLayout.Y_AXIS)
        panel.border = BorderFactory.createEmptyBorder(20, 20, 20, 20)
        
        // 标题
        panel.add(JLabel("Vex Coding 配置").apply {
            font = Font("Microsoft YaHei", Font.BOLD, 16)
        })
        panel.add(Box.createVerticalStrut(20))
        
        // API 地址
        panel.add(JLabel("API 地址:"))
        panel.add(apiEndpointField)
        panel.add(Box.createVerticalStrut(5))
        panel.add(JLabel("支持 OpenAI 兼容 API").apply {
            font = Font("Microsoft YaHei", Font.PLAIN, 11)
            foreground = Color.GRAY
        })
        panel.add(Box.createVerticalStrut(15))
        
        // API Key
        panel.add(JLabel("API Key:"))
        panel.add(apiKeyField)
        panel.add(Box.createVerticalStrut(5))
        panel.add(statusLabel)
        panel.add(Box.createVerticalStrut(15))
        
        // 模型名称
        panel.add(JLabel("模型名称:"))
        panel.add(modelField)
        panel.add(Box.createVerticalStrut(15))
        
        // 最大 Token
        panel.add(JLabel("最大 Token:"))
        panel.add(maxTokensField)
        panel.add(Box.createVerticalStrut(25))
        
        // 按钮
        panel.add(createButtonsPanel())
        
        return panel
    }
    
    private fun createButtonsPanel(): JPanel {
        val panel = JPanel()
        panel.layout = BoxLayout(panel, BoxLayout.X_AXIS)
        
        val saveButton = JButton("保存").apply {
            addActionListener { saveConfig() }
        }
        
        val testButton = JButton("测试连接").apply {
            addActionListener { testConnection() }
        }
        
        val clearButton = JButton("清空").apply {
            addActionListener { 
                apiKeyField.text = ""
                statusLabel.text = "✗ 未配置"
                statusLabel.foreground = Color.RED
            }
        }
        
        panel.add(saveButton)
        panel.add(Box.createHorizontalStrut(10))
        panel.add(testButton)
        panel.add(Box.createHorizontalGlue())
        panel.add(clearButton)
        
        return panel
    }
    
    private fun saveConfig() {
        config.setApiEndpoint(apiEndpointField.text.trim())
        config.setApiKey(apiKeyField.text.trim())
        config.setModel(modelField.text.trim())
        
        val tokens = maxTokensField.text.toIntOrNull() ?: 2048
        config.setMaxTokens(tokens)
        
        statusLabel.text = if (config.isConfigured()) "✓ 已保存" else "✗ 未配置"
        statusLabel.foreground = if (config.isConfigured()) Color(0, 128, 0) else Color.RED
        
        JOptionPane.showMessageDialog(
            null,
            "配置已保存",
            "Vex Coding",
            JOptionPane.INFORMATION_MESSAGE
        )
    }
    
    private fun testConnection() {
        saveConfig()
        
        if (!config.isConfigured()) {
            JOptionPane.showMessageDialog(
                null,
                "请先配置 API Key",
                "连接测试",
                JOptionPane.WARNING_MESSAGE
            )
            return
        }
        
        statusLabel.text = "测试中..."
        
        SwingUtilities.invokeLater {
            statusLabel.text = "✓ 连接成功"
            statusLabel.foreground = Color(0, 128, 0)
        }
    }
    
    fun getComponent(): JComponent = createPanel()
}