package com.vex.coding

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
 * 项目打开监听器
 */
class VexCodingProjectListener : com.intellij.openapi.project.ProjectManagerListener {
    override fun projectOpened(project: Project) {
        // 初始化项目配置
        ConfigService.getInstance().loadProjectConfig(project)
    }
}