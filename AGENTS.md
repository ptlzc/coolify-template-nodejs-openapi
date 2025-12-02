**本指南分为四部分：全局原则、代码规范与约束、GitHub MCP 模式流程、本地 Git 模式流程。**

执行逻辑：

1. 先执行 **第一章** 进行检测。
2. 无论进入哪种模式，在涉及代码编写时，必须严格遵守 **第二章** 的规范。
3. 根据检测结果，决定执行 **第三章**（MCP模式）还是 **第四章**（本地模式）。

## 第一章：全局原则与模式检测

本章定义全局规则，并在工作开始时必须首先执行。

### 1.1 通用注意事项

- **语言**：始终使用中文进行响应。
- **准确理解用户意图**：禁止自行创建任何的兜底、fallback 逻辑。
- **重构优先**：对于用户的修改请求，优先理解为重构。
- **聚焦目标**：禁止在用户的需求上添油加醋，每次执行完回顾目标是否达成。
- **禁止无关建议**：禁止给任何与用户需求无关的建议。
- **环境适配**：任何涉及包下载等内容，优先使用中国大陆加速镜像，或者使用环境变量中配置的代理。
- **超时与异步**：执行命令前评估耗时；一旦预计或检测到耗时超限（如 ping > 30s），立即回收控制权并汇报。
- **Windows 兼容性**：在 Windows 环境下执行命令，必需显式地声明编码为 UTF-8，避免乱码。

### 1.2 初始化与模式检测 (入口)

在开始任何工作流（如 `/spec`）之前，必须执行一次本检测。

1. **检测 Git 远程**：运行 `git config --get remote.origin.url`，检查是否包含 `github.com`。
2. **检测 MCP 可用性**：运行 `github.get_me`，检查是否成功。
3. **路由决策**：
    - **IF (Git=GitHub && MCP=OK):**
        - 设置模式：`MCP_MODE = TRUE`
        - 汇报：“已激活 GitHub MCP 模式。即将按照 **第三章** 流程执行。”
        - 后续操作严格遵循 **第三章 (Chapter 3)**。
    - **ELSE:**
        - 设置模式：`MCP_MODE = FALSE`
        - 汇报：“未检测到 MCP 环境或非 GitHub 仓库。即将按照 **第四章** 流程执行。”
        - 后续操作严格遵循 **第四章 (Chapter 4)**。

---

## 第二章：代码规范与强制约束

**适用范围**：无论处于 MCP 模式还是本地模式，编写代码时均必须强制执行本章规定。本章采用 **Google Style Guides** 作为基础，叠加项目特定的注释约束。

### 2.1 Google 代码风格基础 (Google Style Guides)

所有代码必须符合 Google 针对该语言的官方风格指南（Google Java Style, Google Python Style, Google JavaScript Style 等）。

- **命名规范**：
    - 变量与函数名必须清晰、具象，禁止使用 `tmp`, `val`, `data` 等模糊命名（除非在极短的循环闭包中）。
    - 严格遵守驼峰式 (CamelCase) 或蛇形 (snake_case) 的语言特定惯例。
    - 常量必须使用 `CONSTANT_CASE`。
- **格式化**：
    - 严格遵守 2 空格或 4 空格缩进（视语言标准而定，如 JS/TS 通常为 2 空格，Python 为 4 空格）。
    - 行宽限制通常为 80 或 100 字符，超出必须换行。
- **最佳实践 (Clean Code)**：
    - **DRY 原则**：不要重复代码，逻辑重复超过两次必须抽取为函数。
    - **单一职责**：每个函数只做一件事。
    - **错误处理**：禁止空的 `catch` 块；错误信息必须具有描述性。

### 2.2 强制性方法/函数注释规范

在符合 Google Style 的 JSDoc/Docstring 基础上，**必须**增加特定的 `[ comment ]` 约束区块。

### 2.2.1 结构要求

每个方法（Method）或函数（Function）的顶部注释必须包含：

1. **基本信息**：描述、参数（@param）、返回值（@returns）、异常（@throws）。语言必须为**中文**。
2. **约束区块**：必须在注释底部包含 `[ comment ]` 区块。

### 2.2.2 `[ comment ]` 区块详解

- **定义**：该区块用于记录用户对该方法的特定需求、业务逻辑约束、边界条件或特殊注意事项。
- **读取规则**：Prompt 在读取或审查代码时，必须**高优先级**解析此区块内容，并检查代码实现是否违反了这里的约束。

### 2.2.3 标准模板与示例

**模板：**

```jsx
/**
 * <简要描述方法功能>。
 * <此处遵循 Google Style 的 JSDoc 格式>
 * @param {type} <name> - <desc>，<约束条件>。
 * @returns {type} <desc>。
 * @throws {Error} <desc>（如果有）。
 * * [ comment ]
 * <此处填写用户对本方法的特定需求和约束>
 */
function functionName(args) {
    // ...
}
```

**示例（必须严格参考）：**

```jsx
/**
 * 计算两个整数的和。
 * @param {number} a - 第一个整数，必须非负。
 * @param {number} b - 第二个整数，必须非负。
 * @returns {number} 两数之和。
 * @throws {Error} 如果 a 或 b 为负数。
 * * [ comment ]
 * 这里可以放置特定的业务逻辑约束，例如：
 * 计算前必须先验证参数有效性，且报错信息必须包含"参数不能为负数"。
 */
function add(a, b) {
    if (a < 0 || b < 0) {
        throw new Error("参数不能为负数");
    }
    return a + b;
}
```

---

## 第三章：GitHub MCP 模式标准作业程序 (SOP)

适用场景：MCP_MODE == TRUE。

本章节利用 MCP 工具实现 Issues、PR、Releases 的全自动化管理。

### 3.1 结构与命名规范 (MCP 版)

### 3.1.1 目录结构 (ai-process/)

即使在 MCP 模式下，本地也需要 `ai-process/` 作为状态缓存，用于在多轮对话中保持任务上下文。

- **位置**：项目根目录 `ai-process/` (建议加入 `.gitignore`)。
- **清理**：在 `/ok` 阶段自动清理。

### 3.1.2 任务仪表盘 (dashboard.md)

- **功能**：本地状态机，用于记录 Spec 和 Task 的执行进度。
- **ID 规范**：`S{n}` (Spec) -> `S{n}-T{k}` (Task)。

### 3.1.3 Git 与 GitHub 命名规范

- **分支格式**：`<type>/<brief-description>` (如 `feat/user-login`)。
- **Issue 标题格式**：
    - `Spec Issue`: `<branch-name> <中文标题>`
    - `Task Issue`: `<branch-name> <中文标题 - task标题>`
- **层级关系**：Task Issue 应当通过 GitHub 的 sub-issue 功能关联到 Spec Issue。

### 3.2 核心工作流 (MCP 版)

### 3.2.1 /spec (定义与计划)

**目标**：自动化创建 Issue 结构。

1. **Git 准备**：切换到 `<base>` 分支，`git pull`，创建新分支 `git switch -c <branch>`。
2. **本地规划**：创建 `ai-process/specs/s{n}/spec.md` 撰写方案。
3. **登记**：在 `dashboard.md` 中登记 Spec (`S{n}`) 和拆解后的 Tasks (`S{n}-T{k}`)。
4. **MCP 执行**：调用 `github.create_issue` 创建主 Spec Issue。
5. **(可选)** 批量创建 Task Issues 并关联。
6. **汇报**：展示 Issue 链接，请求批准。

### 3.2.2 /do (执行开发)

**目标**：执行代码并提交。

1. **执行 Task**：更新 `dashboard.md` 状态。
2. **开发**：编写代码、重构、本地测试、Lint 检查。**(严禁违反第二章 Google Style 及注释规范)**
3. **提交**：`git commit` (本地提交)。
4. **循环**：直到所有 Task 完成。
5. **汇报**：任务完成，提示进入 `/pr`。

### 3.2.3 /pr (自动提审)

**目标**：推送代码并创建 PR、合并 PR 并清理。

1. **推送**：`git push -u origin <feature-branch>`。
2. **生成描述**：基于 `spec.md` 和 `dashboard.md` 生成 PR 正文（含关联 Issue 号）。
3. **MCP 执行**：调用 `github.create_pull_request`。标题遵循 `feat/name` 格式。
4. **检查与合并**：检查 PR 状态。若为 open，调用 `github.merge_pull_request` (Method: squash)。
    - *注意*：若合并失败（CI 挂了或有冲突），立即停止并报错。
5. **切回Main分支并清理**：
    - 删除本地分支。
    - 删除 `ai-process/` 目录。
6. **汇报**：任务闭环，准备接收新 Spec。

### 3.2.5 /rel (自动发布)

**目标**：发布 GitHub Release。

1. **版本处理**：推断 `$NEW_VERSION`，更新 `changelog.md`。
2. **Git 操作**：提交 Changelog，打 Tag，推送 Tag。
3. **MCP 执行**：调用 `github.create_release` (Tag: `$NEW_VERSION`)。
4. **汇报**：发布完成。

---

## 第四章：本地 Git 模式标准作业程序 (SOP)

适用场景：MCP_MODE == FALSE。

本章节完全依赖本地 Git 命令和文件系统，不涉及远程仓库推送或 Release。

### 4.1 结构与命名规范 (本地版)

### 4.1.1 目录结构 (ai-process/)

本地模式下，该目录是工作的核心载体。生命周期管理：

- **创建**：在 `/spec` 阶段初始化。
- **隔离**：创建新分支前，必须确保旧的 `ai-process` 已被清理，避免污染。
- **归档**：合并回主干时，`ai-process` 的变更不应被合并（通常在 `.gitignore` 中），或者在合并前手动删除。

```latex
ai-process/
├── dashboard.md              # 进度总览
└── specs/
    └── s1-login/             # 规格详情
        ├── spec.md
        └── tasks/
```

### 4.1.2 Git 分支规范

- **格式**：`<type>/<brief-description>`。
- **Type**：`feat`, `fix`, `refactor`, `docs`, `chore`。
- **Base 分支**：优先 `main` 或 `master`。

### 4.2 核心工作流 (本地版)

### 4.2.1 /spec (定义与计划)

**目标**：本地文件规划。

1. **Git 准备**：切换到 `<base>`，创建分支 `git switch -c <branch>`。
2. **本地规划**：初始化 `ai-process/dashboard.md`。创建 `specs/s{n}/spec.md` 撰写方案。
3. **拆解**：在 `dashboard.md` 中拆解 Tasks。
4. **汇报**：展示规划内容，请求用户批准。

### 4.2.2 /do (执行开发)

**目标**：执行代码并提交。

1. **执行 Task**：更新 `dashboard.md` 状态为 `进行中`。
2. **开发**：编码、修改、重构、测试。**(严禁违反第二章 Google Style 及注释规范)**
3. **提交**：`git commit` (本地提交)。
4. **更新**：更新 `dashboard.md` 状态为 `已完成`。
5. **循环**：直到所有 Task 完成。
6. **汇报**：任务完成，提示进入 `/pr`。

### 4.2.3 /pr (本地合并)

**目标**：直接执行合并，不进行远程交互。

1. **切换分支**：`git checkout <base>`。
2. **执行合并**：
    
    `git merge --squash <feature-branch>
    git commit -m "feat: <spec-title>"`
    
3. **清理本地环境**：
    - 删除分支：`git branch -D <feature-branch>`。
    - 删除文档：`rm -rf ai-process/` (彻底清理上下文)。
4. **汇报**：任务闭环，环境已清理。特性分支已合并至 `<base>`。

## 第五章：项目架构特性模块 (按需激活)

当**项目说明**中包含“Docker容器化”、“OpenAPI”或“CI/CD”等关键词，或项目中存在 `Dockerfile`、`github/workflows` 等文件时，必须激活对应的特性规范。

### 5.1 Docker Native 特性 (容器化开发规范)

**核心目标**：确保开发环境一致性，最大化利用缓存，防止 Docker Command 变得臃肿难维护。

1. **文件结构映射**：
    - `dev/compose.infra.yml`: 纯基础设施（DB, Redis等），使用持久卷 `${PROJECT_NAME}_data_*`。
    - `dev/compose.dev.yml`: 应用栈（API/Web）。必须开启**源码挂载（Bind Mounts）** 或使用 Docker Compose Watch 模式，实现修改即生效。
    - `docker/Dockerfile`: 开发/CI 共用。必须在构建阶段集成 `pnpm install` 或 `go mod download` 等依赖安装步骤。
2. **模块化 Entrypoints (`docker/*-entrypoint.sh`)**：
    - **位置**：所有 Entrypoint 脚本必须存放于 `docker/` 目录下，与 `Dockerfile` 保持同级，便于 Docker 构建上下文管理。
    - **原则**：禁止在 `docker-compose.yml` 的 `command` 字段中编写过长的 Shell 命令。应根据服务名称拆分为独立的 Shell 脚本（如 `docker/backend-entrypoint.sh`, `docker/frontend-entrypoint.sh`）。
    - **职责**：脚本需承担“启动前置逻辑”（例如：前端容器拉取 OpenAPI 生成 SDK、后端容器运行数据库迁移），然后再启动主进程。
    - **智能依赖安装 (必须)**：所有入口脚本必须包含**“锁文件检测机制”**（如检测 `pnpm-lock.yaml` 变化），若变化则自动重装依赖，否则跳过。
3. **缓存策略**：
    - **构建缓存**：编写 Dockerfile 时，必须使用 BuildKit 缓存挂载（如 `RUN --mount=type=cache,target=/root/.local/share/pnpm/store`），避免重复下载依赖。
    - **层级优化**：将依赖安装层（Dependencies Layer）与源码复制层（Source Layer）分离。

### OpenAPI 特性 (契约驱动规范)

**核心目标**：单一事实来源（SSOT），杜绝前后端手动对齐接口文档。

1. **契约产生 (Backend)**：
    - **代码即文档**：禁止手写 Swagger/OpenAPI JSON。必须由后端代码（Model/Schema/Annotation）自动生成。
    - **暴露方式**：开发容器启动后，后端服务必须暴露 HTTP 端点（如 `/docs/json`）供其他容器访问。
2. **契约消费 (Frontend)**：
    - **自动生成 SDK**：前端容器启动脚本中，应包含 `gen:api` 步骤。
    - **流程**：`Wait for Backend Healthz` -> `Fetch OpenAPI JSON` -> `Generate TypeScript Client` -> `Start Dev Server`。
    - **网络代理**：前端代码中严禁硬编码后端 URL。统一使用相对路径 `/api`，通过开发服务器（Vite/Webpack）的 Proxy 功能转发至后端容器（如 `http://api:backend_port`）。

### CI/CD & ACR 特性 (自动化构建与发布)

**核心目标**：实现构建与部署的完全解耦，确保交付一致性。生成 CI 脚本时必须遵循以下强制约束：

1. **触发与并发控制 (Trigger & Concurrency)**：
    - **分支限制**：CI 脚本中的 `on: push` 必须且只能限制在 `branches: [ "main" ]`。禁止在 Feature 分支触发构建。
    - **自动取消机制**：必须配置 `concurrency` 策略，设置 `cancel-in-progress: true`。当 `main` 分支有新的提交推送时，立即终止旧的正在运行的 CI 任务，避免资源浪费和部署版本冲突。
2. **Job 步骤强制顺序 (Step Execution)**：
    - **Docker Login 优先**：在 `steps` 执行序列中，**登录 ACR** (`docker login`) 必须作为紧随 `checkout` 之后的第一个功能性步骤执行。确保在执行任何读取名称或构建操作前，仓库权限已就绪。
    - **动态名称读取**：必须通过脚本（如 `jq` 或 `node`）动态读取 `package.json` 中的 `name` 字段，用于构建镜像 Tag。
3. **部署一致性 (Deployment Consistency)**：
    - **Coolify 对齐**：GitHub Actions 构建并推送到 ACR 的镜像（Registry + Name + Tag）必须与 `docker-compose.coolify-deploy.yml` 中的镜像定义完全一致。
