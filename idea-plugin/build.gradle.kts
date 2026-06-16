plugins {
    id("java")
    id("org.jetbrains.kotlin") version "1.9.22"
    id("org.jetbrains.intellij") version "1.17.4"
}

group = "com.vex"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    
    // 测试
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.10.2")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.10.2")
    testImplementation("org.assertj:assertj-core:3.25.3")
}

// Kotlin 编译器配置
kotlin {
    jvmToolchain(17)
}

// IntelliJ Platform 配置
intellij {
    pluginId.set("com.vex.coding")
    version.set("2024.1")
    type.set("IC")
}

// 任务配置
tasks {
    // 运行 IDE
    runIde {
        // 不需要签名
        args("--no-splash")
    }
    
    // 测试
    test {
        useJUnitPlatform()
    }
    
    // 打包插件
    patchPluginXml {
        sinceBuild.set("241")
        untilBuild.set("243.*")
    }
    
    // 签名
    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN") ?: "")
        privateKey.set(System.getenv("PRIVATE_KEY") ?: "")
        password.set(System.getenv("PRIVATE_KEY_PASSWORD") ?: "")
    }
    
    // 发布
    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN") ?: "")
    }
}