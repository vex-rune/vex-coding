package com.vex.coding.service

import com.vex.coding.config.ConfigService
import kotlinx.coroutines.*
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

/**
 * 代码补全项
 */
data class CompletionItem(
    val text: String,
    val startLine: Int,
    val confidence: Double
)

/**
 * 代码补全服务
 */
class CompletionService {
    
    private val config = ConfigService.getInstance()
    private val contextService: ContextService
    private val httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build()
    
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    constructor(project: com.intellij.openapi.project.Project) {
        this.contextService = ContextService(project)
    }
    
    /**
     * 获取补全建议
     */
    suspend fun getCompletions(
        file: com.intellij.openapi.vfs.VirtualFile,
        position: com.intellij.openapi.editor.LogicalPosition
    ): List<CompletionItem> = withContext(Dispatchers.IO) {
        if (!config.isConfigured()) {
            return@withContext emptyList()
        }
        
        try {
            val context = contextService.buildContext()
            val source = context.files.firstOrNull()?.content ?: return@withContext emptyList()
            
            // 提取光标周围的代码
            val lines = source.split("\n")
            val aroundCursor = lines.drop(
                maxOf(0, position.line - 10)
            ).take(20).joinToString("\n")
            
            val request = buildCompletionRequest(aroundCursor, file.extension ?: "txt")
            
            val httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("${config.getApiEndpoint()}/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer ${config.getApiKey()}")
                .POST(HttpRequest.BodyPublishers.ofString(request))
                .timeout(Duration.ofSeconds(10))
                .build()
            
            val response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString())
            
            if (!response.statusCode().toString().startsWith("2")) {
                return@withContext emptyList()
            }
            
            parseCompletionResponse(response.body())
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * 构建补全请求
     */
    private fun buildCompletionRequest(context: String, language: String): String {
        val prompt = """请根据上下文预测最可能的代码补全。

语言: $language
上下文:
```
$context
```

请只返回补全的代码，不需要解释。"""
        
        return buildString {
            append("{")
            append("\"model\": \"${config.getModel()}\",")
            append("\"messages\": [")
            append("{\"role\": \"system\", \"content\": \"你是一个代码补全助手，只返回补全代码，不做解释。\"},")
            append("{\"role\": \"user\", \"content\": ${prompt.jsonEscape()}}")
            append("],")
            append("\"max_tokens\": 256,")
            append("\"temperature\": 0.3")
            append("}")
        }
    }
    
    /**
     * 解析补全响应
     */
    private fun parseCompletionResponse(body: String): List<CompletionItem> {
        val contentStart = body.indexOf("\"content\":\"") + 11
        val contentEnd = body.indexOf("\"", contentStart)
        
        if (contentStart > 10 && contentEnd > contentStart) {
            val content = body.substring(contentStart, contentEnd)
                .replace("\\n", "\n")
                .replace("\\\"", "\"")
                .replace("```", "")
                .trim()
            
            if (content.isNotBlank()) {
                return listOf(
                    CompletionItem(
                        text = content,
                        startLine = 0,
                        confidence = 0.85
                    )
                )
            }
        }
        
        return emptyList()
    }
    
    private fun String.jsonEscape(): String {
        return this.replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t")
    }
}