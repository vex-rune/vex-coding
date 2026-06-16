package com.vex.coding.service

import com.vex.coding.config.ConfigService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy

/**
 * LLMService 单元测试
 */
class LLMServiceTest {
    
    @BeforeEach
    fun setup() {
        val config = ConfigService.getInstance()
        config.setApiKey("")
    }
    
    @Test
    fun `should throw exception when not configured`() {
        val service = LLMService()
        val context = Context(
            files = emptyList(),
            cursor = CursorPosition(1, 1),
            selectedCode = null
        )
        
        assertThatThrownBy {
            runBlocking {
                service.chat("test", context)
            }
        }
            .isInstanceOf(LLMException::class.java)
            .hasMessageContaining("API Key")
    }
}

/**
 * 辅助测试类
 */
private fun <T> runBlocking(block: suspend () -> T): T {
    return kotlinx.coroutines.runBlocking(block)
}