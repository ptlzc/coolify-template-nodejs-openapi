import type { AppStore } from './store.js'

export function startSimulation(store: AppStore) {
  setInterval(() => {
    const mps = Math.max(10, Math.round(20 + Math.random() * 60))
    const backlog = Math.max(100, Math.round(800 + Math.random() * 600))
    const storageGb = Number((store['metrics']?.storageGb ?? 6) + Math.random() * 0.05)

    if ((store as any).updateMetrics) {
      ;(store as any).updateMetrics({ mps, backlog, storageGb })
    }
  }, 5000)
}
