import { useOperator } from '../api/useOperator'
import { Operator } from './Operator'

const time = (ts: number) => new Date(ts).toLocaleTimeString([], { hour12: false })

// Operator log lines, shown as a terminal with the watcher in the corner.
export function LiveFeed() {
  const { snapshot, events, connected } = useOperator()
  const s = snapshot?.status

  const title = s ? `${s.namespace}/${s.name} is ${s.phase}` : connected ? 'Connecting to the operator' : 'Cannot reach the operator API'

  return (
    <div className="feed" role="log" aria-live="polite" aria-label="Operator log">
      <div className="feed__head">
        <Operator className="feed__avatar" />
        <p className="feed__title">{title}</p>
        {snapshot && <span className="feed__mode">{snapshot.simulated ? 'simulated' : 'live'}</span>}
      </div>
      <ul className="feed__lines">
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
