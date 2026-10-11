import { useEffect, useState, type ReactNode } from 'react'
import { operator } from '../api/store'
import type { DestroyGuard, Phase } from '../api/types'
import { useNow, useOperator } from '../api/useOperator'

const num = (n: number | null, digits = 0) => (n === null ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: digits }))

function ago(iso: string | null, now: number) {
  if (!iso) return 'never'
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000))
  if (s < 60) return `${s} s ago`
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  return `${Math.floor(s / 3600)} h ago`
}

// State is always an icon plus a word, never colour alone.
function Status({ phase }: { phase: Phase }) {
  const icon: Record<Phase, ReactNode> = {
    Running: <circle cx="6" cy="6" r="4.5" fill="currentColor" />,
    Degraded: <path d="M6 1 11 10.5H1Z" fill="currentColor" />,
    Restoring: <path d="M6 1.5a4.5 4.5 0 1 0 0 9Z" fill="currentColor" />,
    Creating: <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />,
    Terminating: <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" />,
  }
  return (
    <span className={`status status--${phase.toLowerCase()}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        {icon[phase]}
      </svg>
      {phase}
    </span>
  )
}

function Tile({ label, value, sub, bad }: { label: string; value: ReactNode; sub: ReactNode; bad?: boolean }) {
  return (
    <div className={bad ? 'tile tile--bad' : 'tile'}>
      <dt className="tile__label">{label}</dt>
      <dd className="tile__body">
        <span className="tile__value">{value}</span>
        <span className="tile__sub">{sub}</span>
      </dd>
    </div>
  )
}

function DestroyControl({ guard }: { guard: DestroyGuard }) {
  const [armed, setArmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 8000)
    return () => clearTimeout(t)
  }, [armed])
  useEffect(() => {
    if (!guard.allowed) setArmed(false)
  }, [guard.allowed])

  const run = async () => {
    setBusy(true)
    setError(null)
    const r = await operator.destroy()
    setBusy(false)
    setArmed(false)
    if (!r.ok) setError(r.error)
  }

  if (armed && guard.allowed) {
    return (
      <div className="destroy">
        <p className="destroy__warn">This deletes the demo database&rsquo;s volume for everyone on this page. The operator should notice and restore it from the last backup.</p>
        <div className="destroy__row">
          <button type="button" className="btn btn--danger" onClick={run} disabled={busy}>
            {busy ? 'Deleting' : 'Yes, delete it'}
          </button>
          <button type="button" className="btn" onClick={() => setArmed(false)}>
            Keep it
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="destroy">
      <button type="button" className="btn btn--danger" disabled={!guard.allowed || busy} onClick={() => setArmed(true)}>
        Delete the database
      </button>
      {!guard.allowed && (
        <p className="destroy__note">
          {guard.reason}
          {guard.cooldownSec ? ` Try again in about ${Math.ceil(guard.cooldownSec / 60)} min.` : ''}
        </p>
      )}
      {error && (
        <p className="destroy__note destroy__note--error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Live numbers from the operator, plus the delete button.
export function DemoDb() {
  const { snapshot, connected, lostVisits } = useOperator()
  const now = useNow()

  if (!snapshot) return <p className="dbpanel__wait">{connected ? 'Connecting...' : 'The operator API is not reachable, so there is nothing to show yet.'}</p>

  const { status, metrics, visits, viewers, destroy } = snapshot

  return (
    <div className="dbpanel">
      <div className="dbpanel__head">
        <p className="dbpanel__name">
          {status.namespace}/{status.name}
        </p>
        <Status phase={status.phase} />
        <p className="dbpanel__viewers">{viewers === 1 ? '1 person watching' : `${viewers} people watching`}</p>
      </div>

      <dl className="tiles">
        {visits.ok ? (
          <Tile
            label="Visits in the database"
            value={num(visits.total)}
            sub={
              lostVisits > 0 ? (
                <span className="tile__loss">
                  Rolled back: {lostVisits} {lostVisits === 1 ? 'visit was' : 'visits were'} lost
                </span>
              ) : (
                `${num(visits.unique)} unique visitors`
              )
            }
          />
        ) : (
          <Tile bad label="Visits in the database" value="Unavailable" sub={`The database said: ${visits.error}`} />
        )}
        <Tile label="Reconcile runs" value={num(metrics.reconciles)} sub={metrics.reconcileAvgMs === null ? 'operator metrics unavailable' : `${num(metrics.reconcileAvgMs, 1)} ms on average`} />
        <Tile label="Last backup" value={ago(status.lastBackup, now)} sub={`${num(metrics.backups ?? status.backupCount)} taken since start`} />
        <Tile label="Recoveries" value={num(metrics.restores)} sub={metrics.recoveryAvgSec === null ? 'none yet' : `${num(metrics.recoveryAvgSec, 1)} s from loss to restored`} />
      </dl>

      <DestroyControl guard={destroy} />
    </div>
  )
}
