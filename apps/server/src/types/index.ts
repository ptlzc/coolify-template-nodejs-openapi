export interface DashboardSnapshot {
  totals: {
    readyAccounts: number
    totalAccounts: number
    mps: number
    backlog: number
    storageGb: number
  }
  trend: Array<{ timestamp: string; mps: number }>
  accountShare: Array<{ accountId: string; nickname: string; percentage: number }>
  queueDetail: Array<{ name: string; size: number }>
}
