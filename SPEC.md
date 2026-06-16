# Vex-Coding 规格文档

> AI 编程助手插件，对标通义灵码，支持 JetBrains IDE 和 VSCode

## 1. 项目概述

### 1.1 目标
构建一款跨平台的 AI 编程插件，提供代码补全、问答、生成等能力，帮助开发者提升编程效率。

### 1.2 核心价值
- **跨平台一致**：IDEA 与 VSCode 体验一致
- **轻量高效**：本地引擎处理基础任务，减少网络依赖
- **隐私安全**：代码不上传云端，仅必要的上下文发送

### 1.3 目标用户
- 个人开发者
- 中小团队

## 2. 整体架构

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                     IDE 交互层                               │
│  ┌─────────────────────┐     ┌─────────────────────────┐   │
│  │   JetBrains Plugin  │     │    VSCode Extension     │   │
│  │   (Kotlin)          │     │    (TypeScript)         │   │
│  └──────────┬──────────┘     └──────────┬────────────┘   │
└─────────────┼───────────────────────────┼─────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   核心共享层 (core)                         │
│  • 上下文提取 (代码解析、项目结构、语言探测)                   │
│  • LLM 调用抽象 (流式响应、token 计算)                        │
│  • Prompt 工程 (模板管理、多轮对话)                          │
│  • 配置管理 (API Key、偏好设置)                              │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│              本地引擎层 (local-engine)                       │
│  • 轻量代码索引 (语义搜索、符号索引)                          │
│  • 上下文缓存 (对话历史、上下文缓存)                          │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                   云端 API 层                               │
│              (对接 Mimo Token Plan API)                     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 模块职责

| 模块 | 职责 | 技术栈 |
|------|------|--------|
| `idea-plugin` | JetBrains IDE 插件主体 | Kotlin, Gradle |
| `vscode-extension` | VSCode 插件主体 | TypeScript |
| `core` | 共享业务逻辑 | TypeScript |
| `local-engine` | 本地代码索引/缓存 | Rust |

### 2.3 数据流

```
用户操作 → IDE插件 → core上下文提取 → CodeGraph构建 → local-engine缓存 → LLM API调用 → 流式响应 → IDE展示
```

### 2.4 CodeGraph 架构

CodeGraph 是 Vex-Coding 的核心代码语义理解引擎，负责构建项目级代码知识图谱。

#### 2.4.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                   CodeGraph 层                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  代码解析器 (Tree-sitter)                            │   │
│  │  → 支持 Java/Python/JS/TS/Go/Rust 等多语言           │   │
│  │  → AST 生成                                          │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  图构建器 (Graph Builder)                            │   │
│  │  → 节点: 函数/类/变量/接口                            │   │
│  │  → 边: 调用(call)、引用(ref)、继承(inherit)          │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  语义索引 (Semantic Index)                          │   │
│  │  → 符号表索引 (快速符号查找)                         │   │
│  │  → 向量索引 (语义相似检索)                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 2.4.2 代码图结构

```
FunctionNode: calculateTotal
├── symbol: "calculateTotal"
├── kind: FUNCTION
├── calls: [getPrice, applyDiscount]      // 调用关系边
├── references: [items, cart]             // 引用关系边
├── defined_in: ShoppingService            // 归属关系边
├── startLine: 42
├── endLine: 58
└── language: JAVA

ClassNode: ShoppingService
├── symbol: "ShoppingService"
├── kind: CLASS
├── methods: [calculateTotal, checkout]   // 包含关系
├── imports: [Item, Cart, DiscountService]
├── package: "com.example.service"
└── file: "ShoppingService.java"
```

#### 2.4.3 存储结构

解析产生的索引文件保存在项目根目录的 `.vexcoding` 文件夹中：

```
project/
├── .vexcoding/                    # 本地索引缓存
│   ├── config.json                # 项目索引配置
│   ├── graph/                     # 代码图数据
│   │   ├── nodes.json             # 节点数据
│   │   └── edges.json             # 边数据
│   ├── symbols/                   # 符号表索引
│   │   └── index.sqlite           # SQLite 符号索引
│   ├── vectors/                   # 向量索引
│   │   └── embeddings.bin         # Embedding 向量
│   ├── cache/                     # 缓存
│   │   └── chat_history.json      # 对话历史
│   └── rules/                     # 自定义规则 (可选)
│       └── vexcoding.rules.md     # 项目 AI 行为规范
└── .vexcodingignore               # 索引忽略规则
```

**存储文件说明**：

| 文件/目录 | 说明 | 大小估算 |
|-----------|------|----------|
| `config.json` | 索引配置、语言版本 | < 1KB |
| `graph/nodes.json` | 代码节点数据 | 依项目规模 |
| `graph/edges.json` | 代码关系边 | 依项目规模 |
| `symbols/index.sqlite` | 符号快速查找索引 | 依项目规模 |
| `vectors/embeddings.bin` | 语义向量 | 依项目规模 |
| `rules/vexcoding.rules.md` | 自定义 AI 规则 | < 10KB |

#### 2.4.4 自定义规则 (Rules)

同 Cursor 的 `.cursorrules`，支持用户自定义项目级 AI 行为规范。

**规则文件**: `.vexcoding/rules/vexcoding.rules.md`

**规则格式示例**:

````markdown
# VexCoding Rules - MyProject

## 编码规范
- 使用 2 空格缩进
- 类名使用 PascalCase
- 方法名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

## 架构约束
- Controller 只做参数校验和响应封装
- Service 层处理业务逻辑
- Repository 层负责数据访问
- 禁止在 Controller 直接操作数据库

## 代码风格
- 使用 Lombok 减少样板代码
- 优先使用 Stream API
- 日志使用 Slf4j
- 异常使用自定义业务异常

## 特定场景
- 新增 API 必须同步更新 Swagger 文档
- 数据库变更使用 Flyway 迁移脚本
- 单元测试覆盖率 > 80%
````

**规则优先级**:
1. `.vexcoding/rules/vexcoding.rules.md` (项目级)
2. 用户全局规则 (IDE 设置)
3. 内置默认规则

**规则加载时机**:
- 项目打开时自动加载
- 文件修改后自动重新加载
- 支持热更新，无需重启 IDE

#### 2.4.5 .vexcodingignore 规则

同 `.gitignore`，支持 glob 模式：

```
# 忽略第三方库
node_modules/
*.jar
*.dll

# 忽略测试代码（可选）
**/test/
**/*Test*.java

# 忽略配置
.env
*.local.yaml
```

---

## 2.5 设计决策 (Design Decisions)

### 2.5.1 为什么选择 Rust 作为本地引擎？

**问题**: 本地代码索引需要高性能，C++太复杂，Python/JVM启动慢

**分析**:

| 方案 | 启动时间 | 内存占用 | FFI 友好度 | 学习曲线 |
|------|----------|----------|------------|----------|
| Rust | < 50ms | < 20MB | ★★★★★ | 陡峭 |
| C++ | < 10ms | < 10MB | ★★★★★ | 陡峭 |
| Go | < 100ms | < 50MB | ★★★☆☆ | 平缓 |
| Java/JVM | > 500ms | > 150MB | ★★☆☆☆ | 平缓 |

**决策**: 选择 **Rust**

**理由**:
- 启动速度快，满足 IDE 实时性要求
- 内存占用低，不影响 IDE 性能
- FFI 优秀，可被多语言调用
- Tree-sitter 官方推荐
- 虽然学习曲线陡峭，但项目早期投入值得

**替代方案**: 若后续 Rust 维护成本过高，可考虑切换到 Go

---

### 2.5.2 为什么用 TypeScript 共享 core 而非 Rust WASM？

**问题**: 核心逻辑需要跨平台复用，有两个选择：TS 源码共享 或 Rust WASM 编译

**分析**:

| 方案 | 复用方式 | 运行时 | IDE 原生支持 |
|------|----------|--------|--------------|
| TS 源码共享 | 直接 import | Node.js | 需包装层 |
| Rust WASM | 编译为 wasm | 浏览器/Node | ★★★★★ |
| Kotlin Multiplatform | 编译为 JVM/JS/Native | 多平台 | 需插件 |

**决策**: 选择 **TypeScript 源码共享**

**理由**:
- VSCode 插件本身用 TS，天然复用
- IDEA 插件可通过 FFI/JNI 调用 core
- WASM 边界处理复杂，调试困难
- 团队 TS 技能更熟练
- 配置管理、Prompt 模板等逻辑更适合脚本语言

**风险**: IDEA 侧调用需要额外的桥接层，可接受

---

### 2.5.3 为什么 CodeGraph 采用 SQLite 而非图数据库？

**问题**: 代码图数据量大，需要持久化存储，选择嵌入式数据库还是图数据库？

**分析**:

| 方案 | 适用规模 | 查询性能 | 依赖复杂度 | 迁移成本 |
|------|----------|----------|------------|----------|
| SQLite | < 10万节点 | 优秀 | 低 | 无 |
| Neo4j | 任意规模 | 优秀 | 中 | 中 |
| 内存 + JSON | 小项目 | 一般 | 低 | 无 |
| Redis Graph | 中等规模 | 优秀 | 高 | 高 |

**决策**: 选择 **SQLite**

**理由**:
- 项目早期规模可控，SQLite 足够
- SQLite 无独立进程，随用随开
- 支持全文搜索、模糊查询
- 生态成熟，Rust/JavaScript 都有客户端
- 后续如需切换，可导出数据

**预留**: 图遍历需求增长时，可迁移到 Redis Graph 或 Neo4j

---

### 2.5.4 为什么不用 LangChain 等现有框架？

**问题**: LLM 调用抽象层是否直接用 LangChain？

**分析**:

| 方案 | 优势 | 劣势 |
|------|------|------|
| LangChain | 功能丰富，快速开发 | 体积大，定制繁琐 |
| LangServe | 服务化方便 | 需要独立服务 |
| 自研 | 轻量可控，按需实现 | 开发成本高 |

**决策**: 选择 **自研轻量抽象**

**理由**:
- 只需流式响应 + Token 计算，不需要复杂 Agent
- 避免引入重型依赖（LangChain JS > 1MB）
- 对 Mimo API 的特殊需求（如 SSE）更易适配
- 学习成本低，维护简单

**不排除**: 如后续需要复杂 RAG/Agent，可引入 LangChain 部分模块

---

### 2.5.5 为什么 rules 放在 `.vexcoding/rules/` 而非根目录？

**问题**: Cursor 的 `.cursorrules` 放在根目录，为什么我们放在 `.vexcoding/` 子目录？

**分析**:

| 方案 | 整洁度 | 迁移成本 | 用户习惯 |
|------|--------|----------|----------|
| `.vexcoding/rules/` | ★★★★☆ | 高（需新建目录） | 需适应 |
| `.cursorrules` 根目录 | ★★★☆☆ | 低（直接复制） | 习惯 |
| `.vexcodingrules` 根目录 | ★★☆☆☆ | 低 | 不常见 |

**决策**: 选择 **`.vexcoding/rules/`**

**理由**:
- 项目根目录保持整洁，减少视觉干扰
- `.vexcoding/` 目录已存在，规则放一起自然
- 后续可能增加更多配置，统一管理
- 不与用户根目录的 `.cursorrules` 冲突

**迁移**: 提供自动检测和导入 `.cursorrules` 的功能

---

### 2.5.6 为什么支持 .vexcodingignore 而非直接复用 .gitignore？

**问题**: 已有 .gitignore，是否可以直接复用？

**分析**:

| 方案 | 用户成本 | 灵活性 | 实现复杂度 |
|------|----------|--------|------------|
| 复用 .gitignore | 低 | 低（规则可能不匹配） | 低 |
| 独立 .vexcodingignore | 中 | 高（独立配置） | 中 |
| 两者结合 | 中 | 高 | 高 |

**决策**: 选择 **独立 .vexcodingignore + 默认继承 .gitignore**

**理由**:
- 索引需求与 Git 不同（如可能需要包含 test 目录）
- 避免索引和 Git 行为不一致导致困惑
- 但提供默认继承，减少用户配置负担

---

### 2.5.7 为什么本地引擎独立进程而非库集成？

**问题**: Rust 本地引擎是作为独立进程还是库直接集成到 IDE？

**分析**:

| 方案 | 集成复杂度 | 隔离性 | 通信开销 |
|------|------------|--------|----------|
| 独立进程 (gRPC) | 高 | 优秀 | 中（~5ms） |
| 动态库 (so/dylib) | 中 | 一般 | 低 |
| WASM 模块 | 低 | 优秀 | 低 |

**决策**: 选择 **独立进程 (gRPC)**

**理由**:
- Rust 崩溃不会影响 IDE
- 可独立更新，无需重新编译插件
- 多 IDE 实例可共享引擎进程
- gRPC 支持流式调用，适合 CodeGraph 查询

**优化**: 首次调用启动进程，后续复用，通过 Unix Socket 通信

## 3. 功能规格

### 3.1 功能列表

| 功能 | 描述 | 优先级 | 状态 |
|------|------|--------|------|
| F1 代码补全 | 行级/函数级补全建议 | P0 | 规划中 |
| F2 智能问答 | 代码解释、Bug诊断、重构建议 | P0 | 规划中 |
| F3 代码生成 | 根据注释/描述生成代码 | P1 | 规划中 |
| F4 代码解释 | 选中代码 → AI 解释 | P1 | 规划中 |
| F5 多语言支持 | Java, Python, JavaScript, Go, Rust 等 | P0 | 规划中 |

### 3.2 F1 代码补全

**触发方式**
- 打字过程中自动触发（Inline Completion）
- 快捷键触发（`Alt + /`）

**输入**
- 当前光标位置
- 前后代码上下文
- 项目结构信息

**输出**
- 代码补全建议（支持多选项）
- 接受后直接插入

**交互流程**
```
1. 用户输入代码
2. 插件检测补全触发条件
3. 提取上下文（当前文件 + 最近修改文件）
4. 调用本地引擎快速返回基础补全
5. 异步调用云端 API 获取 AI 补全
6. 展示 Inline 补全建议
7. 用户 Tab 接受 / Esc 拒绝
```

### 3.3 F2 智能问答

**触发方式**
- 侧边栏聊天面板
- 快捷键打开（`Alt + Shift + L`）

**输入**
- 用户问题文本
- 当前打开文件 + 光标位置
- 选中的代码片段

**输出**
- 流式文本响应
- 支持代码块高亮
- 支持引用源文件

**交互流程**
```
1. 用户输入问题 / 选中代码右键
2. 提取上下文（当前文件、项目结构）
3. 构建 Prompt（系统模板 + 上下文 + 用户问题）
4. 调用云端 LLM API（流式）
5. 实时展示响应结果
6. 记录对话历史
```

### 3.4 F4 代码解释

**触发方式**
- 选中代码 → 右键菜单 → "AI 解释"
- 快捷键 `Alt + Shift + E`

**输入**
- 选中的代码片段
- 所在文件路径

**输出**
- 浮层气泡展示解释结果
- 支持代码高亮

### 3.5 配置管理

**配置项**
| 配置 | 说明 | 默认值 |
|------|------|--------|
| `apiEndpoint` | Mimo API 端点 | `https://api.mimo.ai` |
| `apiKey` | 用户 API Key | 空 |
| `model` | 使用的大模型 | `mimo-pro` |
| `maxTokens` | 单次最大 token | 2048 |
| `enableLocalCache` | 启用本地缓存 | `true` |
| `proxy` | 代理地址 | 空 |

**配置存储**
- IDEA: IDE Settings → Tools → Vex Coding
- VSCode: VSCode Settings → Extensions → Vex Coding

## 4. 技术规格

### 4.1 技术栈

| 组件 | 选型 | 版本 |
|------|------|------|
| 本地引擎 | Rust | 1.70+ |
| IDEA 插件 | Kotlin | 1.9.x |
| IDEA SDK | Gradle + IntelliJ Platform | 2024.x |
| VSCode 插件 | TypeScript | 5.x |
| 共享核心 | TypeScript | 5.x |
| LLM 调用 | REST API / SSE | - |
| 代码解析 | Tree-sitter | - |

### 4.2 项目结构

```
vex-coding/
├── SPEC.md
├── README.md
│
├── core/                           # 核心共享库
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── types/                  # 共享类型定义
│       │   └── index.ts
│       ├── context/                # 上下文提取
│       │   ├── extractor.ts
│       │   └── parser.ts
│       ├── llm/                    # LLM 调用
│       │   ├── client.ts
│       │   └── types.ts
│       ├── prompt/                 # Prompt 模板
│       │   ├── system.ts
│       │   └── user.ts
│       └── config/                 # 配置管理
│           └── store.ts
│
├── local-engine/                   # 本地引擎 (Rust)
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs                 # 入口
│       ├── graph/                  # CodeGraph 实现
│       │   ├── builder.rs          # 图构建器
│       │   ├── node.rs             # 节点定义
│       │   └── edge.rs             # 边定义
│       ├── indexer/                # 代码索引
│       │   ├── tree_sitter.rs      # Tree-sitter 封装
│       │   └── language.rs         # 语言支持
│       ├── search/                 # 搜索索引
│       │   ├── symbol.rs           # 符号表索引
│       │   └── vector.rs          # 向量索引
│       ├── storage/                # 存储管理
│       │   └── store.rs            # .vexcoding 读写
│       └── cache/                  # 缓存管理
│
├── idea-plugin/                    # JetBrains 插件
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── src/
│       └── main/
│           ├── kotlin/com/vex/coding/
│           │   ├── VexCodingPlugin.kt
│           │   ├── actions/         # 用户操作
│           │   ├── ui/             # UI 组件
│           │   └── service/        # 业务服务
│           └── resources/
│               └── META-INF/
│
└── vscode-extension/               # VSCode 插件
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── extension.ts            # 入口
        ├── commands/              # 命令定义
        ├── views/                  # 视图（侧边栏）
        └── service/                # 业务服务
```

### 4.3 核心类型定义

```typescript
// core/src/types/index.ts

/** 补全请求 */
interface CompletionRequest {
  filePath: string;
  position: Position;
  language: string;
  context: string;
}

/** 补全响应 */
interface CompletionResponse {
  completions: Completion[];
  source: 'local' | 'remote';
}

interface Completion {
  text: string;
  startLine: number;
  confidence: number;
}

/** 问答请求 */
interface ChatRequest {
  message: string;
  context: Context;
  history: ChatMessage[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** 上下文 */
interface Context {
  files: FileInfo[];
  cursor: Position;
  selectedCode?: string;
}

interface FileInfo {
  path: string;
  language: string;
  content: string;
}

interface Position {
  line: number;
  column: number;
}
```

### 4.4 API 设计

**LLM 调用（云端）**

```
POST /v1/chat/completions
Headers:
  Authorization: Bearer {apiKey}
  Content-Type: application/json

Body:
{
  "model": "mimo-pro",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "stream": true,
  "max_tokens": 2048
}
```

### 4.5 性能目标

| 指标 | 目标 |
|------|------|
| 冷启动时间 | < 2s |
| 补全响应时间（本地） | < 100ms |
| 补全响应时间（云端） | < 3s |
| 内存占用（空闲） | < 100MB |

## 5. 发布计划

### 5.1 版本规划

| 版本 | 目标 | 里程碑 |
|------|------|--------|
| v0.1.0 | 核心框架 + 基础问答 | MVP |
| v0.2.0 | 代码补全 | Beta |
| v0.3.0 | 代码解释 + 生成 | 正式版 |

### 5.2 发布渠道

- JetBrains Marketplace: https://plugins.jetbrains.com
- VSCode Marketplace: https://marketplace.visualstudio.com

## 6. 待确认事项

- [ ] 是否需要支持企业私有化部署？
- [ ] 是否需要多模型切换（OpenAI / 本地模型）？
- [ ] 是否需要团队协作功能（共享配置）？

## 7. 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-06-16 | v0.0.1 | 初始架构设计 |