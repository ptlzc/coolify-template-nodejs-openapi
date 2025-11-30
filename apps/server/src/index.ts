import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import fastifySSE from 'fastify-sse-v2'
import { config } from './config.js'
import { AppStore } from './lib/store.js'
import { startSimulation } from './lib/simulator.js'
import { registerDashboardRoutes } from './routes/dashboard.js'
import { registerAccountRoutes } from './routes/accounts.js'
import { registerChatRoutes } from './routes/chats.js'
import { registerTaskRoutes } from './routes/tasks.js'
import { registerDestinationRoutes } from './routes/destinations.js'
import { registerExplorerRoutes } from './routes/explorer.js'
import { registerEventRoutes } from './routes/events.js'
import { componentSchemas } from './schemas.js'

const app = Fastify({ logger: true })
const store = new AppStore()
startSimulation(store)

const bootstrap = async () => {
  await app.register(cors, { origin: config.corsOrigin })
  await app.register(swagger, {
    openapi: {
      info: { title: 'Template API', version: '0.1.0' },
      tags: [{ name: 'dashboard' }, { name: 'accounts' }, { name: 'chats' }, { name: 'tasks' }, { name: 'destinations' }, { name: 'explorer' }]
    }
  })
  app.get('/docs/json', async () => app.swagger())
  await app.register(fastifySSE)

  app.get('/healthz', async () => ({ ok: true, ts: Date.now() }))

  app.register(
    (router, _opts, done) => {
      componentSchemas.forEach((schema) => router.addSchema(schema))
      registerDashboardRoutes(router, store)
      registerAccountRoutes(router, store)
      registerChatRoutes(router, store)
      registerTaskRoutes(router, store)
      registerDestinationRoutes(router, store)
      registerExplorerRoutes(router, store)
      registerEventRoutes(router, store)
      done()
    },
    { prefix: '/api' }
  )

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' })
    app.log.info(`API server listening on ${config.port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

bootstrap()
