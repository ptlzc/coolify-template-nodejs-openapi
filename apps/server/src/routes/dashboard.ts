import type { FastifyInstance } from 'fastify'
import type { AppStore } from '../lib/store.js'
import { dashboardSchema } from '../schemas.js'

export function registerDashboardRoutes(app: FastifyInstance, store: AppStore) {
  app.get('/dashboard', { schema: dashboardSchema }, async () => {
    return store.getDashboardSnapshot()
  })
}
