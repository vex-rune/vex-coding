# Vex-Coding

> AI 编程助手插件，对标通义灵码，支持 JetBrains IDEA 和 VSCode

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](SPEC.md)

---

## 项目目的

### 为什么做这个项目？

**市场背景**

AI 编程助手（如 Copilot、灵码）已成为开发者提效的核心工具。但存在以下问题：

- **价格昂贵**：个人开发者负担重
- **功能封闭**：无法定制和扩展
- **隐私顾虑**：代码上传第三方云端
- **平台割裂**：IDEA 和 VSCode 体验不一致

**我们的目标**

构建一款**开源、跨平台、可定制**的 AI 编程助手：

| 目标 | 说明 |
|------|------|
| 降低门槛 | 对接 Mimo Token Plan，用户自备 API Key，成本可控 |
| 开放透明 | 开源代码，用户可审计、定制 |
| 跨平台一致 | IDEA 和 VSCode 插件体验一致 |
| 本地增强 | 本地代码索引保护隐私，减少云端依赖 |
| 可扩展 | 支持自定义规则 (rules)，适配不同项目 |

### 核心特性

- **智能问答** - 代码解释、Bug 诊断、重构建议
- **代码补全** - 行级/函数级智能补全
- **CodeGraph** - 项目级代码语义理解
- **自定义规则** - 支持项目级 AI 行为规范
- **跨平台** - JetBrains IDEA + VSCode

### 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                     IDE 交互层                               │
│  ┌─────────────────────┐     ┌─────────────────────────┐   │
│  │   JetBrains Plugin  │     │    VSCode Extension     │   │
│  │   (Kotlin)          │     │    (TypeScript)        │   │
│  └──────────┬──────────┘     └──────────┬────────────┘   │
└─────────────┼───────────────────────────┼─────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   核心共享层 (core)                         │
│         TypeScript - LLM 调用 / 配置 / Prompt               │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│              本地引擎 (local-engine)                        │
│              Rust - CodeGraph / 代码索引                    │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                   云端 API                                  │
│              Mimo Token Plan API                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 安装插件

**JetBrains IDEA**
- 下载 `.jar` 文件
- Settings → Plugins → Install from Disk

**VSCode**
- 搜索 `vex-coding` in Marketplace
- Install

### 配置

1. 打开 IDE 设置
2. 找到 Vex Coding 设置
3. 填入 Mimo API Key

### 使用

| 功能 | 操作 |
|------|------|
| 智能问答 | `Alt + Shift + L` 打开聊天面板 |
| 代码解释 | 选中代码 → 右键 → AI 解释 |
| 代码补全 | 自动触发 或 `Alt + /` |

---

## 项目结构

```
vex-coding/
├── SPEC.md           # 功能规格文档
├── ENGINEERING.md    # 工程化规范
├── ROADMAP.md        # 开发路线图
│
├── core/             # TypeScript 核心库
├── local-engine/     # Rust 本地引擎
├── idea-plugin/      # JetBrains IDEA 插件
└── vscode-extension/ # VSCode 插件
```

---

## 开发指南

### 环境要求

- Node.js 20+
- Rust 1.70+
- JDK 17+
- pnpm 8+

### 构建

```bash
# 安装依赖
pnpm install

# 构建全部模块
./scripts/build.sh

# 或分别构建
cd core && pnpm build
cd local-engine && cargo build --release
```

### 测试

```bash
pnpm test          # TypeScript 测试
cargo test         # Rust 测试
./gradlew test     # IDEA 插件测试
```

详细规范见 [ENGINEERING.md](ENGINEERING.md)

---

## 路线图

| 版本 | 目标 |
|------|------|
| v0.1.0 | MVP - 基础问答功能 |
| v0.2.0 | 代码补全 |
| v0.3.0 | 自定义规则 + CodeGraph 增强 |

详见 [ROADMAP.md](ROADMAP.md)

---

## License

MIT License - 详见 [LICENSE](LICENSE) 文件