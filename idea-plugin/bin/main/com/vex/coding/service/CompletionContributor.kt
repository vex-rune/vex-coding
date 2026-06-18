package com.vex.coding.service

import com.intellij.codeInsight.completion.CompletionContributor
import com.intellij.codeInsight.completion.CompletionParameters
import com.intellij.codeInsight.completion.CompletionProvider
import com.intellij.codeInsight.completion.CompletionResultSet
import com.intellij.codeInsight.completion.CompletionType
import com.intellij.codeInsight.lookup.CharFilter
import com.intellij.codeInsight.lookup.LookupElementBuilder
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.TextRange
import com.intellij.patterns.PlatformPatterns
import com.intellij.util.ProcessingContext
import kotlinx.coroutines.*

/**
 * 代码补全贡献者
 */
class VexCompletionContributor(project: Project) : CompletionContributor() {
    
    private val completionService = CompletionService(project)
    
    init {
        extend(
            CompletionType.BASIC,
            PlatformPatterns.psiElement(),
            object : CompletionProvider<CompletionParameters>() {
                override fun addCompletions(
                    parameters: CompletionParameters,
                    context: ProcessingContext,
                    result: CompletionResultSet
                ) {
                    val position = parameters.position
                    val file = position.containingFile?.virtualFile
                    
                    if (file == null) {
                        return
                    }
                    
                    // 在后台获取补全
                    GlobalScope.launch(Dispatchers.Main) {
                        try {
                            val completions = completionService.getCompletions(
                                file,
                                parameters.editor.caretModel.logicalPosition
                            )
                            
                            for (completion in completions) {
                                val element = LookupElementBuilder.create(completion.text)
                                    .withPresentableText(completion.text.take(50))
                                    .withTypeText("AI 补全 (${(completion.confidence * 100).toInt()}%)")
                                
                                result.addElement(element)
                            }
                        } catch (e: Exception) {
                            // 静默处理
                        }
                    }
                }
            }
        )
    }
}