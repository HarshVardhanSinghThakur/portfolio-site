import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { reducedMotion } from './motion'

let lenis: Lenis | null = null

// Lenis smooths wheel input; GSAP's ticker is the single clock for Lenis,
// ScrollTrigger and the shader, so nothing runs a second rAF loop.
export function initScroll() {
  if (reducedMotion) return () => {}

  lenis = new Lenis({ lerp: 0.09 })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: 0 })
  else el.scrollIntoView()
}
