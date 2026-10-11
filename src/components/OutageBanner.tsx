import { useOperator } from '../api/useOperator'

// Everyone on the page sees the outage, not only the person who pressed the button.
export function OutageBanner() {
  const { snapshot, connected } = useOperator()
  const phase = snapshot?.status.phase

  let text: string | null = null
  if (snapshot && !connected) text = 'Lost the connection to the server. Reconnecting.'
  else if (phase === 'Degraded') text = 'The demo database was just deleted. New visits cannot be recorded.'
  else if (phase === 'Restoring') text = 'The operator is restoring the database from the last backup.'

  if (!text) return null
  return (
    <div className="banner" role="status">
      {text}
    </div>
  )
}
