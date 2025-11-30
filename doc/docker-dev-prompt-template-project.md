# Docker 开发环境 & 前后端分离项目落地提示（以 telegram-helper 为模板）

用于在新项目中快速复制“前后端分离 + Docker 开发环境 + 自动依赖/SDK 生成”的最佳实践。复制后按需替换项目名、端口即可。

## 目录/文件映射
- `dev/compose.infra.yml`：基础设施（Postgres/Redis），持久卷与网络命名为 `${PROJECT_NAME}_dev_*`。
- `dev/compose.dev.yml`：应用开发栈（api/web），使用 `develop.watch` 同步源码，环境变量注入代理/OPENAPI。
- `dev/Dockerfile.dev`：开发镜像，预装 pnpm，设置 registry，加入口令校验的 entrypoint。
- `dev/entrypoint.sh`：启动时检测 `pnpm-lock.yaml` 变化或缺失 `node_modules` 自动 `pnpm install --frozen-lockfile` 并缓存哈希。
- `dev/gen-and-dev-web.sh`：web 容器启动脚本，等待 API `healthz` 与 `/docs/json` 就绪后自动 `pnpm gen:api` 拉取 OpenAPI 生成前端 SDK，再启动 Vite。
- `apps/server/src/index.ts`：注册 Swagger (`/docs/json`)，统一路由前缀 `/api`。
- `apps/server/src/schemas.ts`：各路由的 Fastify schema，作为 OpenAPI 契约来源。
- `apps/web/vite.config.ts`：`/api` 代理，目标可通过 `VITE_PROXY_TARGET` 注入（容器内指向 `api:4000`）。
- `apps/web/nginx.conf`：生产静态站点，`/api` 反代到 `api:4000`。
- `package.json` scripts：
  - `dev`: `node dev/scripts/runner.js dev`（启动 infra → dev 栈）
  - `gen:api`: `swagger-typescript-api generate -p $OPENAPI_URL ...`（默认 `http://localhost:4000/docs/json`）
  - 其他：`dev:clear`/`dev:nuke`、`build`、`typecheck` 等

## 缓存与依赖策略
- 镜像层：`pnpm install --frozen-lockfile --prod=false` 放在 Dockerfile 中，减少重复下载。
- 运行时：`dev/entrypoint.sh` 比对 `pnpm-lock.yaml` → 变化或缺少 `node_modules` 则自动安装，避免手工清缓存。
- compose watch：将 `pnpm-lock.yaml` 标记为 `rebuild`，锁文件变化时自动重建容器。

## API 统一与反代
- 开发：Vite 代理 `/api` → `VITE_PROXY_TARGET`（默认本机 4000，容器内 `api:4000`）。前端代码只写 `/api` 相对路径。
- 生产：Nginx `/api` 反代 `api:4000`，保持同源。
- OpenAPI：后端暴露 `/docs/json`，作为前端 SDK 唯一契约来源。

## 自动生成前端 SDK
- 生成器：`swagger-typescript-api`（已作为 devDependency）。
- 启动流程：web 容器启动后等待 `healthz` 和 `/docs/json`，执行 `pnpm gen:api`，失败则继续 dev 并打印提示。
- 输出目录：`apps/web/src/api/index.ts`（Axios 客户端，解包 data）。

## pnpm 重新 install 处理
- 入口脚本根据 lock 哈希自动 install，无需手工删除 `node_modules`。
- 在宿主新增/删除依赖 → `pnpm dev` 时容器检测到 lock 变化会自动安装；如要强制重装，可删除 `.pnpm-lock.sha` 或 `node_modules` 后再跑。

## docker 网络与命名
- 使用外部网络 `${PROJECT_NAME}_dev_net`，api/web/infra 同网桥互通。
- 端口映射示例：API 4000，Web 5173，Postgres 5432，Redis 6379。

## 快速迁移步骤（新项目）
1. 复制 `dev/`、`doc/` 模板与 scripts；更新 `package.json` 的 `name`/端口。
2. 在 `apps/server/src/index.ts` 保留 Swagger `/docs/json`；把路由 schema 放 `schemas.ts`。
3. 调整 Vite 代理/端口与 Nginx 反代端口。
4. 运行 `pnpm install`，然后 `pnpm dev` 验证自动生成 SDK 与前后端互通。

## 常见问题
- **生成器报 Unknown command**：确保脚本使用 `swagger-typescript-api generate -p $OPENAPI_URL ...`，未带 URL 时会被当成命令解析。
- **Fastify 插件版本冲突**：选择与 fastify 主版本匹配的 swagger 插件（fastify 4 对应 swagger 8；无需 swagger-ui 插件时可省略）。
- **Vite 代理连不上**：确认 `VITE_PROXY_TARGET` 在 compose 中指向 `http://api:4000`，并且 api 服务已启动。

本模板可直接作为 Prompt/README 投放新仓库，引导 AI 或开发者快速搭建相同的 Docker dev 体系。
