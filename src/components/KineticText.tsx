import { useEffect, useRef } from 'react'
import { gsap } from '../engine/gsap'
import { reducedMotion } from '../engine/motion'

const RADIUS = 0.17 // pointer influence, as a fraction of viewport width

// Letters catch fire (colour, glow, lift) as the pointer nears them. Only the
// --p custom property is driven from here, so GSAP is free to own the
// transform for the entrance animation.
export function KineticText({ text, className = '' }: { text: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const el = root.current!
    const chars = Array.from(el.querySelectorAll<HTMLElement>('[data-c]'))
    const level = chars.map(() => 0)
    let px = -9999
    let py = -9999
    let visible = true

    const onMove = (e: PointerEvent) => {
      px = e.clientX
      py = e.clientY
    }
    const onLeave = () => {
      px = py = -9999
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(el)

    const tick = () => {
      if (!visible) return
      const reach = window.innerWidth * RADIUS
      const rects = chars.map((c) => c.getBoundingClientRect())
      rects.forEach((r, i) => {
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2)) / reach
        const target = Math.max(0, 1 - d) ** 2
        const next = level[i] + (target - level[i]) * 0.14
        if (Math.abs(next - level[i]) > 0.002) {
          level[i] = next
          chars[i].style.setProperty('--p', next.toFixed(3))
        }
      })
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <span ref={root} className={`kt ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((ch, i) => (
          <span key={i} className="kt__c" data-c>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
    </span>
  )
}
