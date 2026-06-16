package com.vex.coding.config

import com.intellij.openapi.components.ServiceManager
import com.intellij.openapi.project.Project
import java.util.prefs.Preferences

/**
 * 配置服务
 */
class ConfigService {
    
    private var apiKey: String = ""
    private var apiEndpoint: String = "https://api.mimo.ai"
    private var model: String = "mimo-pro"
    private var maxTokens: Int = 2048
    
    companion object {
        fun getInstance(): ConfigService = ServiceManager.getService(ConfigService::class.java)
    }
    
    fun getApiKey(): String = apiKey
    
    fun setApiKey(key: String) {
        apiKey = key
    }
    
    fun getApiEndpoint(): String = apiEndpoint
    
    fun setApiEndpoint(endpoint: String) {
        apiEndpoint = endpoint
    }
    
    fun getModel(): String = model
    
    fun setModel(model: String) {
        this.model = model
    }
    
    fun getMaxTokens(): Int = maxTokens
    
    fun setMaxTokens(tokens: Int) {
        this.maxTokens = tokens
    }
    
    fun isConfigured(): Boolean = apiKey.isNotBlank()
    
    fun loadProjectConfig(project: Project) {
        // 从项目配置加载
        // TODO: 实现从 .vexcoding/config.json 加载
    }
    
    fun validate(): ValidationResult {
        val errors = mutableListOf<String>()
        
        if (apiKey.isBlank()) {
            errors.add("API Key 未设置")
        }
        
        if (apiEndpoint.isBlank()) {
            errors.add("API Endpoint 未设置")
        }
        
        if (maxTokens <= 0) {
            errors.add("MaxTokens 必须大于 0")
        }
        
        return ValidationResult(
            valid = errors.isEmpty(),
            errors = errors
        )
    }
}

data class ValidationResult(
    val valid: Boolean,
    val errors: List<String>
)