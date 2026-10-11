// Mirrors portfolio-api/src/types.ts: that file defines what the server sends.
export type Phase = 'Creating' | 'Running' | 'Degraded' | 'Restoring' | 'Terminating'
export type Level = 'info' | 'warn' | 'error' | 'ok'

export interface OperatorEvent {
  id: number
  ts: number
  level: Level
  text: string
}

export interface DbStatus {
  name: string
  namespace: string
  phase: Phase
  lastBackup: string | null
  backupCount: number
}

export interface Metrics {
  reconciles: number | null
  reconcileAvgMs: number | null
  backups: number | null
  restores: number | null
  recoveryAvgSec: number | null
}

export type VisitStats = { ok: true; total: number; unique: number } | { ok: false; error: string }

export interface DestroyGuard {
  allowed: boolean
  reason?: string
  cooldownSec?: number
}

export interface PodInfo {
  name: string
  ready: string
  status: string
  createdAt: number
}

export interface Snapshot {
  simulated: boolean
  status: DbStatus
  metrics: Metrics
  pods: PodInfo[]
  visits: VisitStats
  viewers: number
  destroy: DestroyGuard
}

export interface OperatorState {
  connected: boolean
  snapshot: Snapshot | null
  events: OperatorEvent[]
  // visits recorded after the last backup and gone after a restore; set only for a visitor who watched it happen
  lostVisits: number
}
