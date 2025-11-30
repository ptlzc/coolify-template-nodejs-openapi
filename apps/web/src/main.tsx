import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => (
  <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
    <h1>coolify-template-nodejs-openapi</h1>
    <p>前后端分离模板：pnpm + Docker dev + OpenAPI 自动生成前端 SDK。</p>
    <ul>
      <li>运行 <code>pnpm dev</code>：自动启动 infra/api/web，生成 <code>apps/web/src/api</code></li>
      <li>后端 Swagger：<code>/docs/json</code>（dev 容器内）</li>
      <li>前端直接请求 <code>/api</code>，代理/反代已配置</li>
    </ul>
  </div>
)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
