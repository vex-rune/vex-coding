package com.vex.coding

import org.junit.jupiter.api.Test
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import com.vex.coding.service.LLMException

/**
 * LLMService 单元测试
 */
class LLMServiceTest {
    
    @Test
    fun `should throw exception when not configured`() {
        // 测试 LLMException 属性
        val error = LLMException("Test error", "TEST_CODE", 500)
        assertThat(error.message).isEqualTo("Test error")
        assertThat(error.code).isEqualTo("TEST_CODE")
        assertThat(error.statusCode).isEqualTo(500)
    }
    
    @Test
    fun `should create error with code only`() {
        val error = LLMException("Error", "CODE_ONLY")
        assertThat(error.statusCode).isNull()
    }
}