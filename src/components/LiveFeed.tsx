import type { PodInfo } from '../api/types'
import { useNow, useOperator } from '../api/useOperator'
import { Operator } from './Operator'

const time = (ts: number) => new Date(ts).toLocaleTimeString([], { hour12: false })

// kubectl style: seconds under two minutes, then minutes, hours, days
function age(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  if (s < 120) return `${s}s`
  if (s < 7200) return `${Math.floor(s / 60)}m`
  if (s < 172800) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

const tone = (status: string) => {
  if (status === 'Running') return 'ok'
  if (status === 'Completed') return 'done'
  if (['Pending', 'ContainerCreating', 'PodInitializing'].includes(status)) return 'warn'
  return 'error' // Terminating, Error, CrashLoopBackOff, ImagePullBackOff, ...
}

// `kubectl get pods`, redrawn from the cluster every couple of seconds.
function Pods({ pods, connected }: { pods: PodInfo[] | undefined; connected: boolean }) {
  const now = useNow()
  return (
    <div className="pods">
      <p className="pods__cmd">$ kubectl get pods -n portfolio</p>
      {pods === undefined || pods.length === 0 ? (
        <p className="pods__empty">{connected ? 'waiting for the cluster...' : 'no connection'}</p>
      ) : (
        <table className="pods__table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>READY</th>
              <th>STATUS</th>
              <th>AGE</th>
            </tr>
          </thead>
          <tbody>
            {pods.map((p) => (
              <tr key={p.name} className={`pods__row pods__row--${tone(p.status)}${now - p.createdAt < 15_000 ? ' pods__row--new' : ''}`}>
                <td title={p.name}>{p.name}</td>
                <td>{p.ready}</td>
                <td>{p.status}</td>
                <td>{age(now - p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// Live view of the cluster: the pods as kubectl lists them, with the operator's own log lines under them, so a
// pod disappearing and the line that explains it are on screen together.
export function LiveFeed() {
  const { snapshot, events, connected } = useOperator()
  const s = snapshot?.status

  const title = s ? `${s.namespace}/${s.name} is ${s.phase}` : connected ? 'Connecting to the operator' : 'Cannot reach the operator API'

  return (
    <div className="feed">
      <div className="feed__head">
        <Operator className="feed__avatar" />
        <p className="feed__title">{title}</p>
        {snapshot && <span className="feed__mode">{snapshot.simulated ? 'simulated' : 'live'}</span>}
      </div>
      <Pods pods={snapshot?.pods} connected={connected} />
      <p className="feed__label">operator log</p>
      <ul className="feed__lines" role="log" aria-live="polite" aria-label="Operator log">
        {events.length === 0 && <li className="feed__line">{connected ? 'waiting for the first reconcile...' : 'no connection'}</li>}
        {events.map((e) => (
          <li key={e.id} className={`feed__line feed__line--${e.level}`}>
            <time>{time(e.ts)}</time> {e.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
