import type { FastifySchema } from 'fastify'

export const dashboardSchema: FastifySchema = {
  tags: ['dashboard'],
  summary: 'Dashboard snapshot',
  response: {
    200: {
      type: 'object',
      properties: {
        totals: {
          type: 'object',
          properties: {
            readyAccounts: { type: 'number' },
            totalAccounts: { type: 'number' },
            mps: { type: 'number' },
            backlog: { type: 'number' },
            storageGb: { type: 'number' }
          },
          required: ['readyAccounts', 'totalAccounts', 'mps', 'backlog', 'storageGb']
        },
        trend: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              mps: { type: 'number' }
            },
            required: ['timestamp', 'mps']
          }
        },
        accountShare: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              accountId: { type: 'string' },
              nickname: { type: 'string' },
              percentage: { type: 'number' }
            },
            required: ['accountId', 'nickname', 'percentage']
          }
        },
        queueDetail: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              size: { type: 'number' }
            },
            required: ['name', 'size']
          }
        }
      },
      required: ['totals', 'trend', 'accountShare', 'queueDetail']
    }
  }
}

// component schemas
export const componentSchemas = [
  {
    $id: 'account',
    type: 'object',
    properties: {
      id: { type: 'string' },
      nickname: { type: 'string' },
      phone: { type: 'string' },
      status: { type: 'string' },
      ready: { type: 'boolean' },
      taskCount: { type: 'number' },
      createdAt: { type: 'string' },
      lastActiveAt: { type: 'string' }
    },
    required: ['id', 'nickname', 'phone', 'status', 'ready', 'taskCount', 'createdAt', 'lastActiveAt']
  }
]
