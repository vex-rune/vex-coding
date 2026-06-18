package com.vex.coding.service

import org.junit.jupiter.api.Test
import org.assertj.core.api.Assertions.assertThat

/**
 * CompletionService 单元测试
 */
class CompletionServiceTest {
    
    @Test
    fun `should create completion item`() {
        val item = CompletionItem(
            text = "return true;",
            startLine = 10,
            confidence = 0.85
        )
        
        assertThat(item.text).isEqualTo("return true;")
        assertThat(item.startLine).isEqualTo(10)
        assertThat(item.confidence).isEqualTo(0.85)
    }
    
    @Test
    fun `should create completion item with low confidence`() {
        val item = CompletionItem(
            text = "// TODO: implement",
            startLine = 1,
            confidence = 0.3
        )
        
        assertThat(item.confidence).isLessThan(0.5)
    }
    
    @Test
    fun `should create completion item with high confidence`() {
        val item = CompletionItem(
            text = "}\n}",
            startLine = 50,
            confidence = 0.95
        )
        
        assertThat(item.confidence).isGreaterThan(0.9)
    }
}