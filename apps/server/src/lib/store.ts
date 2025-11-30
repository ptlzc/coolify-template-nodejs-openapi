import { EventEmitter } from 'node:events'
import { nanoid } from 'nanoid'
import type { DashboardSnapshot } from '../types/index.js'

export class AppStore {
  private metrics = { mps: 28, backlog: 980, storageGb: 6.2 }
  private trend: DashboardSnapshot['trend'] = []
  public events = new EventEmitter()

  constructor() {
    const now = Date.now()
    const trend: DashboardSnapshot['trend'] = []
    for (let i = 23; i >= 0; i -= 1) {
      trend.push({
        timestamp: new Date(now - i * 60 * 60 * 1000).toISOString(),
        mps: Math.max(10, Math.round(20 + Math.random() * 30))
      })
    }
    this.trend = trend
  }

  getDashboardSnapshot(): DashboardSnapshot {
    return {
      totals: {
        readyAccounts: 2,
        totalAccounts: 3,
        mps: this.metrics.mps,
        backlog: this.metrics.backlog,
        storageGb: Number(this.metrics.storageGb.toFixed(2))
      },
      trend: this.trend,
      accountShare: [
        { accountId: 'acc-001', nickname: '节点A', percentage: 55 },
        { accountId: 'acc-002', nickname: '节点B', percentage: 45 }
      ],
      queueDetail: [
        { name: 'command_queue', size: Math.max(0, Math.round(this.metrics.backlog * 0.35)) },
        { name: 'backfill_queue', size: Math.max(0, Math.round(this.metrics.backlog * 0.65)) }
      ]
    }
  }
}
