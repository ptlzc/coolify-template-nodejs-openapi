import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import fastifySSE from 'fastify-sse-v2'
import { config } from './config.js'
import { AppStore } from './lib/store.js'
import { dashboardSchema } from './schemas.js'

const app = Fastify({ logger: true })
const store = new AppStore()

const bootstrap = async () => {
  await app.register(cors, { origin: config.corsOrigin })
  await app.register(swagger, {
    openapi: {
      info: { title: 'Template API', version: '0.1.0' },
      tags: [{ name: 'dashboard' }]
    }
  })
  app.get('/docs/json', async () => app.swagger())
  await app.register(fastifySSE)

  app.get('/healthz', async () => ({ ok: true, ts: Date.now() }))
  app.get('/api/dashboard', { schema: dashboardSchema }, async () => store.getDashboardSnapshot())

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' })
    app.log.info(`API server listening on ${config.port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

bootstrap()
