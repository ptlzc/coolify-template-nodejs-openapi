# coolify-template-nodejs-openapi

快速启动的前后端分离模板，特点：
- pnpm workspace + Nx 任务编排
- Docker 开发栈：`pnpm dev` 自动启动 infra(api/web) 并 watch
- 自动依赖安装：entrypoint 比对 lock 变更
- 自动前端 SDK：web 容器启动后从 `/docs/json` 生成 TS API 客户端（swagger-typescript-api）
- `/api` 相对路径 + 代理/反代已配置（Vite/Nginx）
- ACR CI：镜像名默认读取 package.json name

## 关键命令
- 开发：`pnpm dev`
- 本机代码 + 容器基础设施：`pnpm dev:local`
- 清理容器保留卷：`pnpm dev:clear`
- 彻底清理：`pnpm dev:nuke`
- 手动生成 API SDK：`pnpm gen:api`（默认 http://localhost:4000/docs/json）

## 目录
- `dev/` 开发 compose/Dockerfile/entrypoint 脚本
- `apps/server` Fastify + Swagger `/docs/json`
- `apps/web` Vite + 代理 `/api`，Nginx 生产反代
- `doc/docker-dev-prompt-template-project.md` 迁移/使用说明

## 快速开始（本机）
```bash
pnpm install
pnpm dev
# 打开 http://localhost:5173/
# API 健康: http://localhost:4000/healthz, OpenAPI: http://localhost:4000/docs/json
```

## 注意
- 如需 swagger UI，请自行添加与 fastify 版本兼容的 UI 插件。
- 默认 registry 使用 npm 镜像（npmmirror），可在 Dockerfile.dev 调整。
