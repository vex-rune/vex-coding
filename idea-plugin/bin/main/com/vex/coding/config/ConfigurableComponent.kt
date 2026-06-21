package com.vex.coding.config

import com.intellij.openapi.options.Configurable
import javax.swing.*

/**
 * IDEA 设置配置
 */
class ConfigurableComponent : Configurable {
    
    private val configPanel = ConfigPanel()
    
    override fun createComponent(): JComponent {
        return configPanel.createPanel()
    }
    
    override fun isModified(): Boolean {
        return true // 简化：始终认为已修改
    }
    
    override fun apply() {
        // 配置已由 ConfigPanel 自动保存
    }
    
    override fun reset() {
        // 重置为默认值
    }
    
    override fun getDisplayName(): String {
        return "Vex Coding"
    }
    
    override fun getHelpTopic(): String? {
        return "vex-coding-settings"
    }
}