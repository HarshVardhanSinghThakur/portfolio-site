import { operator } from '../api/store'
import type { Phase } from '../api/types'
import { gsap } from './gsap'
import { scene } from './scene'

const MOOD: Record<Phase, number> = {
  Running: 0,
  Creating: 0.3,
  Restoring: 0.5,
  Terminating: 0.8,
  Degraded: 1,
}

// The background shader mirrors the database's real phase.
export function bindMood() {
  let last: Phase | undefined
  return operator.subscribe(() => {
    const phase = operator.getState().snapshot?.status.phase
    if (!phase || phase === last) return
    last = phase
    gsap.to(scene, { mood: MOOD[phase], duration: 0.6, overwrite: 'auto' })
  })
}
