package com.vex.coding.service

import com.vex.coding.config.ConfigService
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

/**
 * LLM 错误类型
 */
class LLMException(
    message: String,
    val code: String,
    val statusCode: Int? = null
) : RuntimeException(message)

/**
 * LLM 服务
 */
class LLMService {
    
    private val config = ConfigService.getInstance()
    private val httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(60))
        .build()
    
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    /**
     * 发送聊天消息
     */
    suspend fun chat(message: String, context: Context): String {
        if (!config.isConfigured()) {
            throw LLMException("请先配置 API Key", "NOT_CONFIGURED")
        }
        
        val messages = buildMessages(message, context)
        
        val request = HttpRequest.newBuilder()
            .uri(URI.create("${config.getApiEndpoint()}/v1/chat/completions"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer ${config.getApiKey()}")
            .POST(HttpRequest.BodyPublishers.ofString(messages))
            .timeout(Duration.ofSeconds(config.getMaxTokens().toLong()))
            .build()
        
        return try {
            val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
            
            if (!response.statusCode().toString().startsWith("2")) {
                throw LLMException(
                    "API 请求失败: ${response.body()}",
                    "API_ERROR",
                    response.statusCode()
                )
            }
            
            parseResponse(response.body())
        } catch (e: LLMException) {
            throw e
        } catch (e: Exception) {
            throw LLMException("网络错误: ${e.message}", "NETWORK_ERROR")
        }
    }
    
    /**
     * 流式聊天
     */
    fun chatStream(message: String, context: Context): Flow<String> = flow {
        if (!config.isConfigured()) {
            throw LLMException("请先配置 API Key", "NOT_CONFIGURED")
        }
        
        val messages = buildMessages(message, context)
        
        val request = HttpRequest.newBuilder()
            .uri(URI.create("${config.getApiEndpoint()}/v1/chat/completions"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer ${config.getApiKey()}")
            .POST(HttpRequest.BodyPublishers.ofString(messages))
            .build()
        
        val response = httpClient.send(request, HttpResponse.BodyHandlers.ofLines())
        
        response.body().forEach { line ->
            if (line.startsWith("data: ")) {
                val data = line.removePrefix("data: ")
                if (data != "[DONE]") {
                    val content = parseStreamChunk(data)
                    if (content.isNotBlank()) {
                        emit(content)
                    }
                }
            }
        }
    }
    
    /**
     * 构建请求消息
     */
    private fun buildMessages(message: String, context: Context): String {
        val messages = mutableListOf<Map<String, String>>()
        
        // 添加上下文
        if (context.files.isNotEmpty()) {
            val contextText = context.files.joinToString("\n\n") { file ->
                "文件: ${file.path}\n```${file.language}\n${file.content}\n```"
            }
            messages.add(mapOf(
                "role" to "system",
                "content" to "相关代码上下文:\n$contextText"
            ))
        }
        
        // 添加用户消息
        messages.add(mapOf(
            "role" to "user",
            "content" to message
        ))
        
        return buildString {
            append("{")
            append("\"model\": \"${config.getModel()}\",")
            append("\"messages\": ${toJson(messages)},")
            append("\"max_tokens\": ${config.getMaxTokens()}")
            append("}")
        }
    }
    
    /**
     * 解析响应
     */
    private fun parseResponse(body: String): String {
        // 简化解析，实际应该用 JSON 库
        val contentStart = body.indexOf("\"content\":\"") + 11
        val contentEnd = body.indexOf("\"", contentStart)
        
        if (contentStart > 10 && contentEnd > contentStart) {
            return body.substring(contentStart, contentEnd)
                .replace("\\n", "\n")
                .replace("\\\"", "\"")
        }
        
        return body
    }
    
    /**
     * 解析流式块
     */
    private fun parseStreamChunk(chunk: String): String {
        val contentStart = chunk.indexOf("\"content\":\"") + 11
        val contentEnd = chunk.indexOf("\"", contentStart)
        
        if (contentStart > 10 && contentEnd > contentStart) {
            return chunk.substring(contentStart, contentEnd)
                .replace("\\n", "\n")
                .replace("\\\"", "\"")
        }
        
        return ""
    }
    
    private fun toJson(messages: List<Map<String, String>>): String {
        return messages.joinToString(",", "[", "]") { msg ->
            "{\"role\":\"${msg["role"]}\",\"content\":\"${msg["content"]?.replace("\"", "\\\"")}\"}"
        }
    }
}