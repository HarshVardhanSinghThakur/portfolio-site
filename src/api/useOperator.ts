import { useEffect, useState, useSyncExternalStore } from 'react'
import { operator } from './store'

export function useOperator() {
  return useSyncExternalStore(operator.subscribe, operator.getState)
}

// Re-renders every second, for "4 min ago" style labels.
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
