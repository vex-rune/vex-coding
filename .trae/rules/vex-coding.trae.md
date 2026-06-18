# Vex-Coding .trae Rules

> AI 编程助手规则，驱动 vex-coding 项目开发

---

## 项目背景

vex-coding 是一款 AI 编程助手插件，对标通义灵码：
- **目标**：开源、跨平台、可定制的 AI 编程助手
- **用户**：个人开发者、中小团队
- **平台**：JetBrains IDEA (Kotlin) + VSCode (TypeScript)
- **后端**：Rust 本地引擎 + Mimo Token Plan API

---

## 1. 架构原则

### 1.1 分层架构

```
IDE 插件 (Kotlin/TS)
    ↓
核心共享层 core (TypeScript)
    ↓
本地引擎 local-engine (Rust)
    ↓
云端 API (Mimo)
```

**核心约束**：
- IDE 插件只做 UI 和交互，不含业务逻辑
- core 是唯一处理 LLM 调用、配置、Prompt 的地方
- local-engine 处理代码索引，不依赖云端
- 所有平台共享同一套 core

### 1.2 CodeGraph 架构

```
代码输入 → Tree-sitter 解析 → 代码图构建 → 语义索引 → LLM 增强
```

**核心约束**：
- 代码图节点：函数/类/变量/接口
- 代码图边：调用(call)、引用(ref)、继承(inherit)
- 索引存储在项目 `.vexcoding/` 目录
- 支持 `.vexcodingignore` 忽略规则

---

## 2. 技术选型

| 模块 | 技术 | 理由 |
|------|------|------|
| 本地引擎 | Rust | 启动快(<50ms)、内存低、FFI 优秀 |
| core | TypeScript | VSCode 原生、团队熟练、无重型依赖 |
| 图存储 | SQLite | 早期够用、零依赖、零进程 |
| LLM 调用 | 自研 | 轻量(仅需流式+Token)、按需、避免 LangChain |
| 构建工具 | Gradle(Kotlin DSL) | JetBrains 官方推荐 |
| 包管理 | pnpm | 快、小、monorepo 优秀 |
| 测试 | Vitest + JUnit 5 | Vite 集成、原生 TS |

---

## 3. 代码规范

### 3.1 TypeScript (core / VSCode 插件)

**命名规范**：
```typescript
// 类/接口：大驼峰
class ConfigStore {}
interface LLMConfig {}

// 方法/变量：小驼峰
function getApiKey() {}
const maxTokens = 2048;

// 常量：全大写
const MAX_CONTEXT_LENGTH = 8192;
```

**类型约束**：
```typescript
// ✅ 禁止原生类型
function foo(items: Array<string>) {}

// ✅ 使用类型别名
type UserId = string;
function getUser(id: UserId): Promise<User> {}

// ✅ 接口定义完整
interface ChatRequest {
  message: string;
  context: Context;
  history: ChatMessage[];
}
```

**错误处理**：
```typescript
// ✅ 使用自定义错误类
class LLMError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

// ✅ 使用 Result 类型或直接抛出
async function chat(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(...);
  if (!response.ok) {
    throw new LLMError('API 请求失败', 'API_ERROR', response.status);
  }
  return response.json();
}
```

### 3.2 Rust (local-engine)

**命名规范**：
```rust
// 模块：小写下划线
pub mod code_graph {}

// 结构体/枚举：大驼峰
pub struct Node { }
pub enum NodeKind { }

// 方法/变量：小驼峰下划线
pub fn build_graph() { }
let node_id = "1".to_string();

// 常量：全大写下划线
const MAX_DEPTH: usize = 100;
```

**错误处理**：
```rust
// ✅ 使用 thiserror
use thiserror::Error;

#[derive(Error, Debug)]
pub enum EngineError {
    #[error("解析失败: {0}")]
    ParseError(String),
    
    #[error("存储错误: {source}")]
    StorageError {
        #[from]
        source: std::io::Error,
    },
}

// ✅ 使用 anyhow 简化传播
use anyhow::{Result, Context};

pub fn load_graph(path: &Path) -> Result<Graph> {
    let content = std::fs::read_to_string(path)
        .context("读取图文件失败")?;
    // ...
}
```

### 3.3 Kotlin (IDEA 插件)

遵循项目已有的 Java 编码规范 (user_rules)：
- 大驼峰类名、小驼峰方法
- 优先使用 `val` 不可变设计
- `Optional` 的 `map/flatMap` 取值
- 业务异常使用非受检异常

---

## 4. 模块开发顺序

### 4.1 优先级

```
Phase 0: 项目初始化     → 脚手架 + CI
Phase 1: core          → LLM 客户端 + 配置
Phase 2: local-engine  → CodeGraph 基础
Phase 3: IDEA 插件     → 基础问答
Phase 4: VSCode 插件   → 基础问答
Phase 5: 代码补全      → Inline Completion
```

### 4.2 开发约束

**Phase 1 (core)**：
- 先实现 LLM 调用，再实现上下文提取
- 配置管理必须支持持久化
- Prompt 模板必须可扩展

**Phase 2 (local-engine)**：
- 必须通过 gRPC 与插件通信
- SQLite 存储必须支持迁移
- Tree-sitter 必须支持 Java/Python/JS

**Phase 3-4 (IDE 插件)**：
- 必须复用 core，不可重复实现
- UI 必须响应式，支持流式输出
- 快捷键必须可配置

---

## 5. 测试要求

### 5.1 覆盖率目标

| 模块 | 覆盖率 |
|------|--------|
| core | > 80% |
| local-engine | > 75% |
| IDEA 插件 | > 70% |
| VSCode 插件 | > 70% |

### 5.2 测试原则

- **单元测试**：核心逻辑必须覆盖
- **集成测试**：模块间交互必须覆盖
- **E2E 测试**：关键流程必须覆盖
- **禁止**：线程休眠、随机数据、时间依赖

### 5.3 Mock 原则

- 优先 Mock 接口，不 Mock 实现
- 外部依赖（HTTP）必须 Mock
- 内部模块按需 Mock

---

## 6. 存储规范

### 6.1 .vexcoding 目录结构

```
.vexcoding/
├── config.json           # 索引配置
├── graph/
│   ├── nodes.json       # 节点
│   └── edges.json       # 边
├── symbols/
│   └── index.sqlite     # 符号索引
├── vectors/
│   └── embeddings.bin   # 向量
├── cache/
│   └── chat_history.json
└── rules/
    └── vexcoding.rules.md  # 自定义规则
```

### 6.2 忽略规则

- 默认继承 `.gitignore`
- 支持独立 `.vexcodingignore`
- 必须忽略：`node_modules`、`target`、`build`

---

## 7. 提交规范

### 7.1 Commit 格式

```
<type>(<scope>): <subject>

# 示例
feat(core): 新增代码补全上下文提取
fix(engine): 修复 Rust 编译警告
docs(spec): 更新功能规格说明
```

### 7.2 Type 类型

| Type | 用途 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档 |
| style | 格式 |
| refactor | 重构 |
| test | 测试 |
| chore | 构建/工具 |

---

## 8. 决策记录

遇到架构决策时，按以下格式记录：

```
### <决策标题>

**问题**: <描述>

**分析**:
| 方案 | 优势 | 劣势 |
|------|------|------|
| A | ... | ... |
| B | ... | ... |

**决策**: 选择 <方案>

**理由**:
- ...
```

---

## 9. 禁止事项

- ❌ 禁止在 IDE 插件中直接调用 HTTP（必须走 core）
- ❌ 禁止在 local-engine 中引入重型依赖（如 Serde 太重就用精简版）
- ❌ 禁止跳过测试提交代码
- ❌ 禁止修改架构决策但不更新文档
- ❌ 禁止引入安全漏洞（如硬编码 API Key）