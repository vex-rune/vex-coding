package com.vex.coding

import com.intellij.openapi.extensions.LoadingScheme
import com.intellij.openapi.extensions.PluginId
import com.intellij.openapi.startup.ProjectOpenListener
import com.intellij.openapi.project.Project
import com.vex.coding.config.ConfigService

/**
 * Vex Coding 插件主类
 */
class VexCodingPlugin {
    
    companion object {
        const val PLUGIN_ID = "com.vex.coding"
        const val PLUGIN_NAME = "Vex Coding"
        const val PLUGIN_VERSION = "0.1.0"
    }
}

/**
 * 插件初始化
 */
class VexCodingStartupListener : ProjectOpenListener {
    override fun projectOpened(project: Project, isImplicitlyOffline: Boolean) {
        // 初始化项目配置
        ConfigService.getInstance().loadProjectConfig(project)
    }
}