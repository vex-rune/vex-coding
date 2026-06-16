package com.vex.coding.config

import org.junit.jupiter.api.Test
import org.assertj.core.api.Assertions.assertThat

/**
 * ConfigService 单元测试
 */
class ConfigServiceTest {
    
    @Test
    fun `should validate empty api key`() {
        val service = ConfigService()
        val result = service.validate()
        
        assertThat(result.valid).isFalse()
        assertThat(result.errors).contains("API Key 未设置")
    }
    
    @Test
    fun `should validate with api key`() {
        val service = ConfigService()
        service.setApiKey("test-key")
        
        val result = service.validate()
        
        assertThat(result.valid).isTrue()
        assertThat(result.errors).isEmpty()
    }
    
    @Test
    fun `should get and set api key`() {
        val service = ConfigService()
        
        service.setApiKey("my-secret-key")
        assertThat(service.getApiKey()).isEqualTo("my-secret-key")
    }
    
    @Test
    fun `should get and set api endpoint`() {
        val service = ConfigService()
        
        service.setApiEndpoint("https://custom-api.com")
        assertThat(service.getApiEndpoint()).isEqualTo("https://custom-api.com")
    }
    
    @Test
    fun `should get and set model`() {
        val service = ConfigService()
        
        service.setModel("gpt-4")
        assertThat(service.getModel()).isEqualTo("gpt-4")
    }
    
    @Test
    fun `should get and set max tokens`() {
        val service = ConfigService()
        
        service.setMaxTokens(4096)
        assertThat(service.getMaxTokens()).isEqualTo(4096)
    }
    
    @Test
    fun `should check is configured`() {
        val service = ConfigService()
        
        assertThat(service.isConfigured()).isFalse()
        
        service.setApiKey("test-key")
        assertThat(service.isConfigured()).isTrue()
    }
    
    @Test
    fun `should validate invalid max tokens`() {
        val service = ConfigService()
        service.setApiKey("test-key")
        service.setMaxTokens(0)
        
        val result = service.validate()
        
        assertThat(result.valid).isFalse()
        assertThat(result.errors).contains("MaxTokens 必须大于 0")
    }
}