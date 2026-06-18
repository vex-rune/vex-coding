package com.vex.coding.service

import com.intellij.openapi.editor.Caret
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.psi.PsiFile
import com.intellij.psi.PsiManager

/**
 * 上下文信息
 */
data class Context(
    val files: List<FileContext>,
    val cursor: CursorPosition,
    val selectedCode: String?
)

data class FileContext(
    val path: String,
    val language: String,
    val content: String
)

data class CursorPosition(
    val line: Int,
    val column: Int
)

/**
 * 上下文提取服务
 */
class ContextService(private val project: Project) {
    
    /**
     * 提取当前文件的上下文
     */
    fun extractCurrentFile(): FileContext? {
        val editor = com.intellij.openapi.fileEditor.FileEditorManager.getInstance(project)
            .selectedTextEditor ?: return null
        
        val document = editor.document ?: return null
        val file = com.intellij.openapi.fileEditor.FileEditorManager.getInstance(project)
            .selectedFiles.firstOrNull() ?: return null
        
        return FileContext(
            path = file.path,
            language = detectLanguage(file),
            content = document.text
        )
    }
    
    /**
     * 提取光标位置
     */
    fun extractCursor(): CursorPosition {
        val editor = com.intellij.openapi.fileEditor.FileEditorManager.getInstance(project)
            .selectedTextEditor ?: return CursorPosition(1, 1)
        
        val caret = editor.caretModel.primaryCaret
        return CursorPosition(
            line = caret.logicalPosition.line + 1,
            column = caret.logicalPosition.column + 1
        )
    }
    
    /**
     * 提取选中的代码
     */
    fun extractSelection(): String? {
        val editor = com.intellij.openapi.fileEditor.FileEditorManager.getInstance(project)
            .selectedTextEditor ?: return null
        
        val selectedText = editor.selectionModel.selectedText
        return selectedText?.takeIf { it.isNotBlank() }
    }
    
    /**
     * 构建完整上下文
     */
    fun buildContext(): Context {
        val files = mutableListOf<FileContext>()
        
        extractCurrentFile()?.let { files.add(it) }
        
        return Context(
            files = files,
            cursor = extractCursor(),
            selectedCode = extractSelection()
        )
    }
    
    /**
     * 检测语言
     */
    private fun detectLanguage(file: VirtualFile): String {
        val ext = file.extension?.lowercase() ?: return "plaintext"
        
        return when (ext) {
            "java" -> "java"
            "kt", "kts" -> "kotlin"
            "py" -> "python"
            "js", "jsx" -> "javascript"
            "ts", "tsx" -> "typescript"
            "rs" -> "rust"
            "go" -> "go"
            "xml" -> "xml"
            "json" -> "json"
            "md" -> "markdown"
            "sql" -> "sql"
            "gradle", "kts" -> "gradle"
            else -> "plaintext"
        }
    }
}