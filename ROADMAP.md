# Vex-Coding 开发路线图

> 阶段性实现计划，包含核心功能、测试策略、交付标准

---

## 设计决策

### 为什么 MVP 先做 IDEA 再做 VSCode？

**问题**: 两个插件同时开发还是分先后？

**分析**:

| 方案 | 优势 | 劣势 |
|------|------|------|
| 并行开发 | 速度快 | 团队压力大，容易顾此失彼 |
| IDEA 先 | Java 生态强，企业用户多 | VSCode 用户群大 |
| VSCode 先 | TS 原生，调试方便 | 企业用户覆盖少 |

**决策**: 选择 **IDEA 插件先开发**

**理由**:
- Java 生态中 IDEA 是主流，企业用户付费意愿强
- Kotlin 开发体验好，IDE 原生支持
- VSCode 插件开发可借用 core 代码，相对简单
- 分阶段降低复杂度，专注单点突破

**风险**: 如果 VSCode 用户需求强烈，可并行小团队开发

---

### 为什么 Phase 1 先做 core 而非本地引擎？

**问题**: LLM 客户端和本地引擎，哪个先做？

**分析**:

| 方案 | 优势 | 劣势 |
|------|------|------|
| 先 core | 快速验证 LLM 集成 | 本地功能缺失 |
| 先本地引擎 | 代码理解强 | 无法验证效果 |
| 并行 | 两边都有 | 接口契约不清 |

**决策**: 选择 **先 core，再本地引擎**

**理由**:
- core 是 MVP 的核心，没有它无法聊天
- 本地引擎可以先不实现，用简单上下文替代
- 先验证云端 API 集成，再优化本地
- 避免过早优化（Premature Optimization）

**迭代**: Phase 3-4 会逐步加入 CodeGraph 增强

---

### 为什么代码补全放在最后？

**问题**: 代码补全是核心功能，为什么放 Phase 5？

**分析**:

| 方案 | 优势 | 劣势 |
|------|------|------|
| 先做补全 | 用户感知强 | 实现复杂，影响 MVP |
| 后做补全 | MVP 快速验证 | 用户等得久 |

**决策**: 选择 **后做补全 (Phase 5)**

**理由**:
- 智能问答是 MVP 的核心价值，验证市场
- 补全需要 CodeGraph 成熟，过早做效果差
- 补全的交互复杂（Inline UI），需要多轮打磨
- 问答功能简单，见效快，便于收集反馈

**调整**: 如果用户强烈要求，可提前到 Phase 2-3

---

### 为什么测试覆盖率要求 75-80%？

**问题**: 是否需要高覆盖率？是否值得投入？

**分析**:

| 覆盖率 | 投入成本 | 保障程度 |
|--------|----------|----------|
| 50% 以下 | 低 | 低，容易遗漏 |
| 75% | 中 | 良好，覆盖主要路径 |
| 90% 以上 | 高 | 边际效益递减 |

**决策**: 选择 **75-80% 覆盖率**

**理由**:
- 核心逻辑必须覆盖（LLM 调用、配置、上下文提取）
- UI 层难以测试，覆盖 50% 即可
- 避免测试驱动开发（TDD）导致的过度设计
- 用集成测试补充单元测试覆盖不足

**例外**: 简单工具函数可降低到 60%

---

## 阶段概览

| 阶段 | 名称 | 目标 | 预计周期 |
|------|------|------|----------|
| Phase 0 | 项目初始化 | 脚手架 + CI | 1-2 天 |
| Phase 1 | 核心库 core | LLM 客户端 + 配置 | 3-5 天 |
| Phase 2 | 本地引擎 | CodeGraph 基础 | 5-7 天 |
| Phase 3 | IDEA 插件 MVP | 基础问答 | 5-7 天 |
| Phase 4 | VSCode 插件 MVP | 基础问答 | 3-5 天 |
| Phase 5 | 代码补全 | Inline Completion | 5-7 天 |

---

## Phase 0: 项目初始化

### 目标
搭建完整的开发框架和 CI/CD

### 交付物

```
✅ 初始化项目目录结构
✅ 配置好各模块的构建工具
✅ CI 自动构建 + 测试
✅ README.md 入门文档
```

### 实现清单

| 模块 | 任务 | 测试 |
|------|------|------|
| root | 创建目录结构 | - |
| core | 初始化 npm 项目，配置 tsconfig | `pnpm build` 成功 |
| local-engine | 初始化 Rust 项目 | `cargo build` 成功 |
| idea-plugin | 初始化 Gradle 项目 | `./gradlew build` 成功 |
| vscode-extension | 初始化 VSCode 项目 | `pnpm compile` 成功 |
| CI | GitHub Actions 配置 | 绿色构建 |

### 验收标准
- [ ] 所有模块 `build` 成功
- [ ] CI 流水线通过
- [ ] 本地运行 `./scripts/build.sh` 正常

---

## Phase 1: 核心库 core

### 目标
实现 LLM 调用抽象层和配置管理

### 交付物

```
✅ LLM 客户端 (REST API / SSE 流式)
✅ 配置管理 (store)
✅ 类型定义 (types)
✅ Prompt 模板 (prompt)
```

### 实现清单

#### 1.1 类型定义 (`core/src/types/`)

```typescript
// types/index.ts

export interface LLMConfig {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  maxTokens: number;
}

export interface CompletionRequest {
  filePath: string;
  position: Position;
  language: string;
  context: string;
}

export interface ChatRequest {
  message: string;
  context: Context;
  history: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

**单元测试** (`core/src/types/index.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';

describe('LLMConfig', () => {
  it('should have default values', () => {
    const config: LLMConfig = {
      apiEndpoint: 'https://api.mimo.ai',
      apiKey: 'test-key',
      model: 'mimo-pro',
      maxTokens: 2048,
    };
    expect(config.model).toBe('mimo-pro');
  });
});
```

#### 1.2 配置管理 (`core/src/config/`)

```typescript
// config/store.ts

export class ConfigStore {
  private config: LLMConfig;
  
  get(): LLMConfig { ... }
  set(config: Partial<LLMConfig>): void { ... }
  loadFromFile(path: string): void { ... }
  saveToFile(path: string): void { ... }
}
```

**单元测试** (`core/src/config/store.test.ts`):
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('ConfigStore', () => {
  it('should load config from memory', () => {
    const store = new ConfigStore();
    store.set({ apiKey: 'test-key' });
    expect(store.get().apiKey).toBe('test-key');
  });
  
  it('should merge partial updates', () => {
    const store = new ConfigStore();
    store.set({ model: 'mimo-pro' });
    store.set({ maxTokens: 4096 });
    expect(store.get().maxTokens).toBe(4096);
  });
});
```

#### 1.3 LLM 客户端 (`core/src/llm/`)

```typescript
// llm/client.ts

export class LLMClient {
  constructor(private config: LLMConfig) {}
  
  chat(request: ChatRequest): Promise<ChatResponse> { ... }
  chatStream(request: ChatRequest): AsyncIterable<string> { ... }
  completion(request: CompletionRequest): Promise<CompletionResponse> { ... }
}
```

**单元测试** (`core/src/llm/client.test.ts`):
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('LLMClient', () => {
  it('should send chat request', async () => {
    const client = new LLMClient({ apiEndpoint: '...', apiKey: 'test', model: 'mimo-pro', maxTokens: 2048 });
    const mock = vi.spyOn(global, 'fetch').mockResolvedValue(...);
    
    const response = await client.chat({
      message: 'hello',
      context: { files: [], cursor: { line: 1, column: 1 } },
      history: [],
    });
    
    expect(mock).toHaveBeenCalled();
    expect(response.content).toBeDefined();
  });
  
  it('should handle stream response', async () => {
    // 测试 SSE 流式解析
  });
});
```

#### 1.4 Prompt 模板 (`core/src/prompt/`)

```typescript
// prompt/system.ts

export const SYSTEM_PROMPTS = {
  codeExplain: `你是代码解释助手...`,
  bugFix: `你是 Bug 诊断专家...`,
  refactor: `你是重构专家...`,
};

export function buildPrompt(template: string, context: Context): string { ... }
```

**单元测试** (`core/src/prompt/prompt.test.ts`):
```typescript
describe('Prompt', () => {
  it('should build code explain prompt', () => {
    const prompt = buildPrompt(SYSTEM_PROMPTS.codeExplain, {
      files: [{ path: 'Test.java', language: 'java', content: 'class T {}' }],
      cursor: { line: 1, column: 1 },
    });
    expect(prompt).toContain('class T {}');
  });
});
```

### 验收标准
- [ ] `pnpm test` 全部通过
- [ ] `pnpm build` 成功生成 `dist/`
- [ ] 导出类型可被外部使用

---

## Phase 2: 本地引擎 local-engine

### 目标
实现 CodeGraph 基础：代码解析 + 图构建 + 存储

### 交付物

```
✅ Tree-sitter 多语言解析
✅ CodeGraph 图构建器
✅ .vexcoding 存储管理
✅ 符号表索引
```

### 实现清单

#### 2.1 Rust 项目基础

```toml
# Cargo.toml
[package]
name = "vex-engine"
version = "0.1.0"

[dependencies]
tree-sitter = "0.20"
tree-sitter-java = "0.20"
tree-sitter-python = "0.20"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = "0.31"
anyhow = "1.0"
tokio = { version = "1.0", features = ["full"] }
```

#### 2.2 代码解析器 (`local-engine/src/indexer/`)

```rust
// indexer/tree_sitter.rs

pub struct Parser {
    language: Language,
}

impl Parser {
    pub fn new(language: &str) -> Self { ... }
    pub fn parse(&self, source: &str) -> Result<Tree> { ... }
    pub fn extract_symbols(&self, tree: &Tree) -> Vec<Symbol> { ... }
}
```

**单元测试** (`local-engine/src/indexer/test.rs`):
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_parse_java_class() {
        let parser = Parser::new("java");
        let source = "public class Test {}";
        let tree = parser.parse(source).unwrap();
        assert!(tree.root_node().is_some());
    }
    
    #[test]
    fn test_extract_functions() {
        let parser = Parser::new("java");
        let source = "public void foo() {} public void bar() {}";
        let symbols = parser.extract_symbols(&parser.parse(source).unwrap());
        assert_eq!(symbols.len(), 2);
    }
}
```

#### 2.3 图构建器 (`local-engine/src/graph/`)

```rust
// graph/node.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub kind: NodeKind,
    pub name: String,
    pub file: String,
    pub start_line: u32,
    pub end_line: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeKind {
    Class,
    Function,
    Method,
    Variable,
    Interface,
    Enum,
}
```

**单元测试** (`local-engine/src/graph/test.rs`):
```rust
#[test]
fn test_build_call_graph() {
    let source = "class A { void foo() { bar(); } }";
    let nodes = build_graph(source, "java");
    
    let foo = nodes.iter().find(|n| n.name == "foo").unwrap();
    assert!(foo.calls.contains(&"bar".to_string()));
}
```

#### 2.4 存储管理 (`local-engine/src/storage/`)

```rust
// storage/store.rs

pub struct Storage {
    root: PathBuf,
}

impl Storage {
    pub fn new(root: PathBuf) -> Self { ... }
    pub fn save_graph(&self, nodes: &[Node], edges: &[Edge]) -> Result<()> { ... }
    pub fn load_graph(&self) -> Result<(Vec<Node>, Vec<Edge>)> { ... }
    pub fn save_symbols(&self, symbols: &[Symbol]) -> Result<()> { ... }
}
```

**单元测试** (`local-engine/src/storage/test.rs`):
```rust
#[test]
fn test_save_load_graph() {
    let temp_dir = tempfile::tempdir().unwrap();
    let storage = Storage::new(temp_dir.path().to_path_buf());
    
    let nodes = vec![Node { id: "1".into(), kind: NodeKind::Class, name: "Test".into(), file: "Test.java".into(), start_line: 1, end_line: 5 }];
    storage.save_graph(&nodes, &[]).unwrap();
    
    let (loaded_nodes, _) = storage.load_graph().unwrap();
    assert_eq!(loaded_nodes.len(), 1);
}
```

#### 2.5 符号表索引 (`local-engine/src/search/`)

```rust
// search/symbol.rs

pub struct SymbolIndex {
    db: Connection,
}

impl SymbolIndex {
    pub fn insert(&self, symbol: &Symbol) -> Result<()> { ... }
    pub fn search(&self, query: &str) -> Result<Vec<SearchResult>> { ... }
}
```

**单元测试** (`local-engine/src/search/test.rs`):
```rust
#[test]
fn test_symbol_search() {
    let index = SymbolIndex::memory();
    index.insert(&Symbol { name: "calculateTotal".into(), .. }).unwrap();
    
    let results = index.search("calc").unwrap();
    assert!(!results.is_empty());
    assert!(results[0].name.contains("calculateTotal"));
}
```

### 验收标准
- [ ] `cargo test` 全部通过
- [ ] 能解析 Java/Python/JS 代码并构建图
- [ ] `.vexcoding/` 目录正确生成

---

## Phase 3: IDEA 插件 MVP

### 目标
实现 JetBrains 插件的基础问答功能

### 交付物

```
✅ 插件基础框架
✅ 侧边栏聊天面板
✅ 代码上下文提取
✅ 流式响应展示
```

### 实现清单

#### 3.1 插件基础 (`idea-plugin/src/`)

```
src/main/kotlin/com/vex/coding/
├── VexCodingPlugin.kt         # 插件入口
├── actions/
│   └── AskAction.kt           # 问答快捷键
├── ui/
│   ├── ChatPanel.kt           # 聊天面板
│   └── ChatMessageView.kt     # 消息气泡
└── service/
    ├── ContextService.kt      # 上下文提取
    └── LLMService.kt          # LLM 调用
```

#### 3.2 上下文提取 (`service/ContextService.kt`)

```kotlin
class ContextService(private val project: Project) {
    
    fun extractCurrentFile(): FileContext { ... }
    
    fun extractProjectStructure(): List<FileInfo> { ... }
    
    fun extractSelection(): SelectedCode? { ... }
}
```

**单元测试** (`test/ContextServiceTest.kt`):
```kotlin
class ContextServiceTest {
    @Test
    fun `extract current file returns valid context`() {
        val service = ContextService(project)
        val context = service.extractCurrentFile()
        assertNotNull(context.filePath)
        assertTrue(context.content.isNotEmpty())
    }
}
```

#### 3.3 LLM 服务 (`service/LLMService.kt`)

```kotlin
class LLMService(
    private val configStore: ConfigStore,
    private val core: LLMClient,  // 通过 FFI 或 IPC 调用 core
) {
    suspend fun chat(message: String, context: Context): Flow<String> { ... }
}
```

**单元测试** (`test/LLMServiceTest.kt`):
```kotlin
class LLMServiceTest {
    @Test
    fun `chat returns streaming response`() = runTest {
        val service = LLMService(config, client)
        val chunks = service.chat("hello", Context())
        
        var fullText = ""
        chunks.collect { fullText += it }
        
        assertTrue(fullText.isNotEmpty())
    }
}
```

#### 3.4 聊天面板 UI (`ui/ChatPanel.kt`)

```kotlin
class ChatPanel : JPanel() {
    private val messagesArea = JBTextArea()
    private val inputField = JBTextArea()
    private val sendButton = JButton("Send")
    
    fun addMessage(message: String, isUser: Boolean) { ... }
    fun showStreamingResponse(flow: Flow<String>) { ... }
}
```

### 验收标准
- [ ] 插件能正常安装到 IDEA
- [ ] 快捷键 `Alt+Shift+L` 打开聊天面板
- [ ] 能发送问题并接收流式响应
- [ ] 单元测试覆盖核心逻辑

---

## Phase 4: VSCode 插件 MVP

### 目标
实现 VSCode 插件的基础问答功能

### 交付物

```
✅ 插件基础框架
✅ 侧边栏聊天视图
✅ 代码上下文提取
✅ 流式响应展示
```

### 实现清单

```
vscode-extension/src/
├── extension.ts              # 入口
├── commands/
│   └── ask.ts               # 问答命令
├── views/
│   ├── ChatView.ts          # 聊天视图
│   └── MessageView.ts      # 消息组件
└── service/
    ├── ContextService.ts    # 上下文提取
    └── LLMService.ts        # LLM 调用
```

### 验收标准
- [ ] 插件能正常安装到 VSCode
- [ ] 快捷键 `Alt+Shift+L` 打开聊天面板
- [ ] 能发送问题并接收流式响应
- [ ] 单元测试覆盖核心逻辑

---

## Phase 5: 代码补全

### 目标
实现 Inline Completion 代码补全

### 交付物

```
✅ 行级补全触发
✅ 多候选建议
✅ Tab 接受 / Esc 拒绝
✅ 本地快速 + 云端增强
```

### 实现清单

#### 5.1 补全触发器

```kotlin
// IDEA
class CompletionContributor : CompletionContributor() {
    override fun fillCompletionVariants(
        parameters: CompletionParameters,
        result: CompletionResultSet
    ) {
        // 检测触发条件
        // 调用本地引擎快速返回
        // 异步调用云端 API
    }
}
```

#### 5.2 补全服务

```kotlin
class CompletionService(
    private val localEngine: LocalEngine,
    private val llmClient: LLMClient,
) {
    suspend fun getCompletions(
        file: VirtualFile,
        position: LogicalPosition,
    ): List<Completion> { ... }
}
```

**单元测试**:
```kotlin
class CompletionServiceTest {
    @Test
    fun `returns multiple completions`() = runTest {
        val completions = service.getCompletions(file, position)
        assertTrue(completions.size >= 2)
    }
}
```

### 验收标准
- [ ] 打字时自动触发补全建议
- [ ] 支持多选项切换
- [ ] Tab 接受、Esc 拒绝
- [ ] 本地响应 < 100ms

---

## Phase 验收规范

### 验收检查清单

每个 Phase 完成前，必须满足以下条件：

| 检查项 | 要求 | 说明 |
|--------|------|------|
| 单元测试 | 100% 通过 | 所有测试用例必须通过 |
| 覆盖率 | 达到目标 | 各模块覆盖率要求见下表 |
| 构建成功 | `build` 成功 | 产物正确生成 |
| **测试报告** | **必须提交** | **无报告不验收** |

### 测试报告模板

每个 Phase 完成后，必须在对应模块目录下创建 `TEST_REPORT.md`：

```markdown
# Phase X: <模块名> 测试报告

## 1. 测试概述
| 指标 | 结果 |
|------|------|
| 测试文件数 | N |
| 测试用例数 | N |
| 通过数 | N |
| 失败数 | 0 |
| 执行时间 | xxxms |

## 2. 覆盖率报告
| 模块 | 行覆盖 | 函数覆盖 | 目标 | 状态 |
|------|--------|----------|------|------|
| xxx | 85% | 80% | 80% | ✅ |

## 3. 测试详情
[按测试文件列出测试用例]

## 4. 验收标准检查
| 标准 | 状态 |
|------|------|
| 测试通过 | ✅ |
| 覆盖率达标 | ✅ |
| 构建成功 | ✅ |

## 5. 结论
**Phase X 验收通过** ✅
- [x] 所有测试通过
- [x] 覆盖率达标
- [x] 构建成功

**下一阶段**: Phase Y - <模块名>
```

### 禁止事项

- ❌ **禁止跳过测试提交代码**
- ❌ **禁止测试报告缺失进入下一阶段**
- ❌ **禁止覆盖率不达标声称完成**

---

## 测试覆盖率目标

| 阶段 | 模块 | 覆盖率目标 |
|------|------|-----------|
| Phase 1 | core | > 80% |
| Phase 2 | local-engine | > 75% |
| Phase 3 | idea-plugin | > 70% |
| Phase 4 | vscode-extension | > 70% |
| Phase 5 | 全模块 | > 75% |

---

## 下一步行动

### 立即开始：Phase 0

1. 创建目录结构
2. 初始化各模块项目
3. 配置 GitHub Actions CI
4. 验证构建成功

**预计时间**: 1-2 天

---

需要我开始执行 Phase 0 吗？