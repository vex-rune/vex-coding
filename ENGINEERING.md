# Vex-Coding 工程化规范

> 定义开发流程、构建规范、发布标准

---

## 设计决策

### 为什么用 pnpm 而不是 npm/yarn？

**问题**: 包管理器选择

**分析**:

| 工具 | 安装速度 | 磁盘占用 | monorepo 支持 |
|------|----------|----------|---------------|
| npm | 慢 | 大 | 一般 |
| yarn | 中 | 中 | 良好 |
| pnpm | 快 | 小 | 优秀 |

**决策**: 选择 **pnpm**

**理由**:
- 速度快，提升开发体验
- 磁盘占用小（Hard Link）
- monorepo 支持优秀
- VSCode 插件官方推荐

---

### 为什么用 Vitest 而不是 Jest？

**问题**: TS 测试框架选择

**分析**:

| 框架 | 速度 | TypeScript | Vite 集成 |
|------|------|------------|-----------|
| Jest | 慢 | 需配置 | 需插件 |
| Vitest | 快 | 原生支持 | 原生支持 |

**决策**: 选择 **Vitest**

**理由**:
- Vite 生态配套，开发时 HMR 快
- 原生 TypeScript 支持，无需额外配置
- 与 core 的 Vite 构建一致
- 兼容 Jest API，迁移成本低

---

### 为什么用 Gradle 而非 Maven？

**问题**: IDEA 插件构建工具

**分析**:

| 工具 | 灵活性 | Kotlin DSL | 社区 |
|------|--------|------------|------|
| Maven | 一般 | 不支持 | 大 |
| Gradle | 高 | 原生支持 | 大 |

**决策**: 选择 **Gradle + Kotlin DSL**

**理由**:
- Kotlin DSL 与 IDEA 插件 Kotlin 代码一致
- 灵活性高，支持自定义任务
- JetBrains 官方推荐
- 与 Kotlin 团队协作体验好

---

### 为什么用 GitHub Actions 而非 Jenkins/Travis？

**问题**: CI 平台选择

**分析**:

| 平台 | 免费额度 | Git 集成 | 私有 Runner |
|------|----------|----------|-------------|
| GitHub Actions | 2000 min/mo | 原生 | 支持 |
| Jenkins | 自托管 | 需配置 | 自托管 |
| GitLab CI | 400 min/mo | 需迁移 | 支持 |

**决策**: 选择 **GitHub Actions**

**理由**:
- 公共仓库免费额度充足
- 与代码仓库集成，无缝
- 市场丰富（Action 市场）
- 文档完善，社区活跃

---

## 1. 开发环境

### 1.1 必需工具

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 20+ | TypeScript 开发 |
| Rust | 1.70+ | 本地引擎开发 |
| JDK | 17+ | IDEA 插件开发 |
| IntelliJ IDEA | 2024.1+ | Kotlin 开发调试 |
| VSCode | 1.85+ | TS 开发调试 |
| pnpm | 8+ | 包管理 |

### 1.2 环境验证

```bash
# 验证工具版本
node --version  # >= 20.0.0
rustc --version # >= 1.70.0
java -version   # >= 17
pnpm --version  # >= 8.0.0
```

---

## 2. 项目结构

```
vex-coding/
├── ENGINEERING.md              # 本文件
├── SPEC.md                     # 规格文档
├── README.md
│
├── core/                       # TypeScript 核心库
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   └── tests/
│
├── local-engine/               # Rust 本地引擎
│   ├── Cargo.toml
│   ├── src/
│   └── tests/
│
├── idea-plugin/                # JetBrains 插件
│   ├── build.gradle.kts
│   └── src/
│
├── vscode-extension/          # VSCode 插件
│   ├── package.json
│   └── src/
│
├── scripts/                    # 构建脚本
│   ├── build.sh
│   └── release.sh
│
└── docs/                      # 文档
```

---

## 3. 模块开发规范

### 3.1 core (TypeScript)

```bash
# 开发
cd core
pnpm install
pnpm dev

# 测试
pnpm test

# 构建
pnpm build
```

**规范**:
- 使用 ESM 模块
- 严格类型检查 `strict: true`
- 单元测试覆盖率 > 80%

### 3.2 local-engine (Rust)

```bash
# 开发
cd local-engine
cargo build

# 测试
cargo test

# 发布
cargo build --release
```

**规范**:
- 使用 Edition 2021
- 开启 Clippy 检查
- 单元测试 + 集成测试

### 3.3 idea-plugin (Kotlin)

```bash
# 开发 (使用 Gradle 任务)
./gradlew runIde

# 构建
./gradlew buildPlugin

# 打包
./gradlew packagePlugin
```

**规范**:
- Kotlin 1.9.x
- 遵循《Java 编码规范》
- 使用 JUnit 5 + AssertJ 测试

### 3.4 vscode-extension (TypeScript)

```bash
# 开发
cd vscode-extension
pnpm install
pnpm watch

# 调试 (F5)
# 或启动 VSCode Extension Host

# 发布
pnpm package
```

**规范**:
- VSCode API 1.85+
- 使用 Webview API 2.0

---

## 4. 构建流程

### 4.1 一键构建

```bash
# 根目录执行
./scripts/build.sh
```

**构建产物**:

| 模块 | 产物 | 位置 |
|------|------|------|
| core | `dist/` | `core/dist/` |
| local-engine | `vex-engine` | `local-engine/target/release/` |
| idea-plugin | `.jar` | `idea-plugin/build/libs/` |
| vscode-extension | `.vsix` | `vscode-extension/` |

### 4.2 CI 构建

```yaml
# .github/workflows/build.yml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          
      - name: Build core
        run: cd core && pnpm build
        
      - name: Build local-engine
        run: cd local-engine && cargo build --release
        
      - name: Build IDEA plugin
        run: cd idea-plugin && ./gradlew buildPlugin
        
      - name: Build VSCode extension
        run: cd vscode-extension && pnpm package
```

---

## 5. Git 工作流

### 5.1 分支策略

```
main (正式版)
├── develop (开发版)
│   ├── feature/* (功能开发)
│   ├── bugfix/* (Bug 修复)
│   └── hotfix/* (紧急修复)
└── release/* (发布准备)
```

### 5.2 Commit 规范

```
<type>(<scope>): <subject>

# 示例
feat(core): 新增代码补全上下文提取
fix(engine): 修复 Rust 编译警告
docs(spec): 更新功能规格说明
refactor(idea): 重构 UI 服务层
test(core): 添加补全请求单元测试
```

**Type 类型**:

| Type | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式 |
| refactor | 重构 |
| test | 测试 |
| chore | 构建/工具 |

### 5.3 PR 流程

1. Fork `develop` 分支 → `feature/xxx`
2. 开发 + 测试 + 自测
3. 提交 PR → Code Review
4. 合并 → 自动部署到测试环境
5. `develop` → `main` 发布正式版

---

## 6. 发布流程

### 6.1 版本号规则

```
major.minor.patch

示例:
v0.1.0  - 首个正式版
v0.2.0  - 新功能版
v0.2.1  - Bug 修复补丁
```

### 6.2 发布检查清单

- [ ] 所有测试通过
- [ ] CHANGELOG.md 更新
- [ ] 版本号标签打 tag
- [ ] IDEA 插件签名打包
- [ ] VSCode 插件打包上传

### 6.3 发布命令

```bash
# 发布 IDEA 插件
./gradlew publishPlugin

# 发布 VSCode 插件
pnpm vsce publish --pat <token>
```

### 6.4 市场发布

| 市场 | 要求 |
|------|------|
| JetBrains Marketplace | 签名 + 审核 |
| VSCode Marketplace | token 发布 |

---

## 7. 测试策略

### 7.1 分层测试

```
┌─────────────────────────────────────┐
│          E2E 测试                    │  端到端自动化
├─────────────────────────────────────┤
│        集成测试                      │  模块间交互
├─────────────────────────────────────┤
│        单元测试                      │  核心逻辑
└─────────────────────────────────────┘
```

### 7.2 覆盖率要求

| 模块 | 覆盖率目标 |
|------|-----------|
| core | > 80% |
| local-engine | > 75% |
| 共享库 | > 85% |

### 7.3 测试工具

| 类型 | 工具 |
|------|------|
| TS 单元测试 | Vitest |
| TS E2E 测试 | Playwright |
| Rust 测试 | 内置 test framework |
| Kotlin 测试 | JUnit 5 + AssertJ |

---

## 8. 代码质量

### 8.1 Lint 检查

```bash
# 统一检查
./scripts/lint.sh

# 各模块检查
cd core && pnpm lint
cd local-engine && cargo clippy
cd idea-plugin && ./gradlew lint
cd vscode-extension && pnpm lint
```

### 8.2 质量门禁

| 检查项 | 门槛 |
|--------|------|
| TypeScript Lint | 0 errors |
| Rust Clippy | 0 warnings |
| Kotlinktlint | 0 errors |
| 测试覆盖率 | > 75% |
| 安全扫描 | 无高危漏洞 |

### 8.3 Code Review 检查点

- [ ] 功能符合规格
- [ ] 代码可读性
- [ ] 测试覆盖
- [ ] 性能影响
- [ ] 安全风险

---

## 9. 依赖管理

### 9.1 依赖更新策略

- **核心依赖**: 跟随社区稳定版
- **安全补丁**: 24h 内更新
- **大版本升级**: 评估后统一处理

### 9.2 依赖来源

| 模块 | 来源 |
|------|------|
| core | npm registry |
| local-engine | crates.io |
| idea-plugin | Gradle Plugin Portal |
| vscode-extension | npm registry |

---

## 10. 文档规范

### 10.1 必需文档

| 文档 | 更新时机 |
|------|----------|
| SPEC.md | 功能规划/变更 |
| ENGINEERING.md | 工程变更 |
| CHANGELOG.md | 每次发布 |
| README.md | 新手入门 |

### 10.2 API 文档

- OpenAPI 3.0 规范
- Swagger UI 托管
- 示例代码完整

---

## 11. 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-06-16 | v0.0.1 | 初始工程化规范 |