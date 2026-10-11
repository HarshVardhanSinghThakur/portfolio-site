import { useEffect, useRef } from 'react'
import { gsap } from '../engine/gsap'
import { reducedMotion } from '../engine/motion'
import { scene } from '../engine/scene'

// The operator as a hooded watcher in the dark: only its eyes show. They
// follow the pointer and flare wide when the database is down.
export function Operator({ className = '' }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const root = svg.current!
    const eyes = Array.from(root.querySelectorAll<SVGEllipseElement>('.op-eye'))
    let px = 0
    let py = 0
    const onMove = (e: PointerEvent) => {
      px = e.clientX
      py = e.clientY
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const tick = () => {
      const box = root.getBoundingClientRect()
      const ang = Math.atan2(py - (box.top + box.height * 0.5), px - (box.left + box.width / 2))
      const dx = Math.cos(ang) * 3.5
      const dy = Math.sin(ang) * 2.5
      const flare = 1 + scene.mood * 0.9
      eyes.forEach((eye, i) => {
        eye.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${i === 0 ? -14 : 14}deg) scaleY(${flare.toFixed(2)})`
      })
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <svg ref={svg} className={className} viewBox="0 0 120 130" role="img" aria-label="The operator, a hooded figure with glowing red eyes">
      <defs>
        <radialGradient id="eye-glow">
          <stop offset="0" stopColor="#ff6a4a" />
          <stop offset="1" stopColor="#e5382a" />
        </radialGradient>
      </defs>
      <path
        d="M60 8 C28 10 14 44 18 80 C20 102 36 118 60 122 C84 118 100 102 102 80 C106 44 92 10 60 8 Z"
        fill="#0b0c12"
        stroke="rgb(235 228 210 / 0.28)"
        strokeWidth="1.5"
      />
      <ellipse cx="60" cy="62" rx="31" ry="22" fill="#020204" />
      <ellipse className="op-eye" cx="46" cy="60" rx="10" ry="3.6" fill="url(#eye-glow)" style={{ filter: 'drop-shadow(0 0 5px #ff3b2e)' }} />
      <ellipse className="op-eye" cx="74" cy="60" rx="10" ry="3.6" fill="url(#eye-glow)" style={{ filter: 'drop-shadow(0 0 5px #ff3b2e)' }} />
    </svg>
  )
}
