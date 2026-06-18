package com.vex.coding.service

import org.junit.jupiter.api.Test
import org.assertj.core.api.Assertions.assertThat

/**
 * ContextService 单元测试
 */
class ContextTest {
    
    @Test
    fun `should create context with files and cursor`() {
        val context = Context(
            files = listOf(
                FileContext(
                    path = "test.java",
                    language = "java",
                    content = "public class Test {}"
                )
            ),
            cursor = CursorPosition(1, 1),
            selectedCode = null
        )
        
        assertThat(context.files).hasSize(1)
        assertThat(context.cursor.line).isEqualTo(1)
        assertThat(context.cursor.column).isEqualTo(1)
    }
    
    @Test
    fun `should create context with selected code`() {
        val context = Context(
            files = emptyList(),
            cursor = CursorPosition(10, 5),
            selectedCode = "const x = 1;"
        )
        
        assertThat(context.selectedCode).isEqualTo("const x = 1;")
    }
    
    @Test
    fun `should create file context`() {
        val fileContext = FileContext(
            path = "src/main/java/Test.java",
            language = "java",
            content = "public class Test {}"
        )
        
        assertThat(fileContext.path).contains("Test.java")
        assertThat(fileContext.language).isEqualTo("java")
        assertThat(fileContext.content).contains("class Test")
    }
    
    @Test
    fun `should create cursor position`() {
        val cursor = CursorPosition(42, 15)
        
        assertThat(cursor.line).isEqualTo(42)
        assertThat(cursor.column).isEqualTo(15)
    }
}