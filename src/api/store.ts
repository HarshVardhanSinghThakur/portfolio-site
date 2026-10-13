import type { OperatorEvent, OperatorState, Snapshot } from './types'

// Empty = same origin (dev server proxy, or nginx in the cluster). For a site hosted elsewhere, e.g. GitHub Pages,
// set VITE_API_BASE at build time to the API's address, like https://api.harsh.me
const API = ((import.meta.env.VITE_API_BASE as string | undefined) ?? '').replace(/\/$/, '')

let state: OperatorState = { connected: false, snapshot: null, events: [], lostVisits: 0 }
let lastCount: number | null = null // last visit total seen while the database was up
let wasDown = false
let source: EventSource | null = null
// server clock minus this browser's clock. Ages ("pod is 4s old", "backup 2 min ago") compare server timestamps,
// so they must be measured on the server's clock: a visitor's laptop (or the VM) can be minutes off.
let clockOffset = 0
const listeners = new Set<() => void>()

const set = (patch: Partial<OperatorState>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function onSnapshot(s: Snapshot) {
  let lost = state.lostVisits
  if (s.visits.ok) {
    if (wasDown && lastCount !== null) lost = Math.max(0, lastCount - s.visits.total)
    lastCount = s.visits.total
    wasDown = false
  } else if (!wasDown) {
    wasDown = true
    lost = 0
  }
  set({ connected: true, snapshot: s, lostVisits: lost })
}

function connect() {
  const es = new EventSource(`${API}/api/stream`)
  es.addEventListener('snapshot', (e) => onSnapshot(JSON.parse((e as MessageEvent).data)))
  es.addEventListener('log', (e) => {
    const ev = JSON.parse((e as MessageEvent).data) as OperatorEvent
    const events = [...state.events.filter((x) => x.id !== ev.id), ev].sort((a, b) => a.id - b.id).slice(-4)
    set({ events })
  })
  es.addEventListener('ping', (e) => {
    clockOffset = (JSON.parse((e as MessageEvent).data) as { now: number }).now - Date.now()
  })
  es.onopen = () => set({ connected: true })
  es.onerror = () => set({ connected: false })
  source = es
}

function visitorId() {
  try {
    let id = localStorage.getItem('visitor')
    if (!id) {
      id = randomId()
      localStorage.setItem('visitor', id)
    }
    return id
  } catch {
    return randomId()
  }
}

// crypto.randomUUID() only exists on secure origins (https or localhost); on plain http it is undefined and
// calling it crashed the whole page. getRandomValues works everywhere. 32 hex chars, no personal data.
function randomId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
}

export const operator = {
  subscribe(fn: () => void) {
    listeners.add(fn)
    if (!source) connect()
    return () => {
      listeners.delete(fn)
      if (listeners.size === 0) {
        source?.close()
        source = null
      }
    }
  },

  getState: () => state,

  // the current time on the server's clock
  now: () => Date.now() + clockOffset,

  // One anonymous row per browser session: a random id kept on this device, never an IP address.
  recordVisit() {
    try {
      if (sessionStorage.getItem('visited')) return
      sessionStorage.setItem('visited', '1')
    } catch {
      /* private mode: record once per page load */
    }
    fetch(`${API}/api/visit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ visitor: visitorId() }) }).catch(() => {})
  },

  async destroy(): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const res = await fetch(`${API}/api/destroy`, { method: 'POST' })
      if (res.ok) return { ok: true }
      const body = (await res.json().catch(() => ({}))) as { reason?: string; error?: string }
      return { ok: false, error: body.reason ?? body.error ?? `The server answered ${res.status}.` }
    } catch {
      return { ok: false, error: 'Could not reach the server.' }
    }
  },
}
