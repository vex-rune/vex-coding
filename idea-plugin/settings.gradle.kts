pluginManagement {
    repositories {
        maven { url = uri("https://maven.aliyun.com/repository/gradle-plugin") }
        maven { url = uri("https://maven.aliyun.com/repository/public") }
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("org.jetbrains.kotlin.jvm") version "1.9.22" apply false
    id("org.jetbrains.intellij") version "1.17.4" apply false
}

rootProject.name = "vex-coding"