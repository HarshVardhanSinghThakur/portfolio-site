import { useEffect, useRef } from 'react'
import { gsap } from '../engine/gsap'
import { reducedMotion } from '../engine/motion'

// Deterministic, so the roots look the same on every load.
const rng = (seed: number) => {
  let s = seed
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296
}

const STEP = 120
const roots = Array.from({ length: 9 }, (_, i) => {
  const r = rng(i * 97 + 13)
  let x = 70 + i * 107 + (r() - 0.5) * 60
  const pts = [[x, 0]]
  for (let k = 1; k <= 5; k++) {
    x += (r() - 0.5) * 150
    pts.push([x, k * STEP])
  }
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2 + (r() - 0.5) * 80, (a[1] + b[1]) / 2]
  const c = mid(pts[0], pts[1])
  let d = `M${pts[0][0].toFixed(0)} 0 Q${c[0].toFixed(0)} ${c[1]} ${pts[1][0].toFixed(0)} ${pts[1][1]}`
  for (let k = 2; k < pts.length; k++) d += ` T${pts[k][0].toFixed(0)} ${pts[k][1]}`
  const tip = pts[pts.length - 1]
  const branches = [2, 4].map((k, j) => {
    const [bx, by] = pts[k]
    const dir = (i + j) % 2 ? 1 : -1
    return `M${bx.toFixed(0)} ${by} Q${(bx + dir * 55).toFixed(0)} ${by + 45} ${(bx + dir * 110).toFixed(0)} ${by + 105}`
  })
  return { d, branches, tip, width: i % 3 === 0 ? 3 : 1.7 }
})

// Roots that grow down the section as you scroll through it.
export function RootsArt() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.to('.root', {
        strokeDashoffset: 0,
        ease: 'none',
        stagger: 0.04,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'bottom 45%', scrub: true },
      })
      gsap.to('.root-tip', {
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: '70% 70%', end: 'bottom 45%', scrub: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <svg ref={ref} className="roots-art" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <linearGradient id="root-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="640">
          <stop offset="0" stopColor="#ebe4d2" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#ff7b3a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#e5382a" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="tip-glow">
          <stop offset="0" stopColor="#ffd09a" />
          <stop offset="1" stopColor="#ff7b3a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {[170, 340, 500].map((y) => (
        <path key={y} d={`M0 ${y} Q250 ${y - 22} 500 ${y} T1000 ${y}`} fill="none" stroke="#ebe4d2" strokeOpacity="0.06" strokeWidth="1.5" />
      ))}
      {roots.map((r, i) => (
        <g key={i} fill="none" stroke="url(#root-fade)" strokeLinecap="round">
          <path className="root" d={r.d} pathLength={1} strokeWidth={r.width} />
          {r.branches.map((b) => (
            <path key={b} className="root" d={b} pathLength={1} strokeWidth={1.1} />
          ))}
        </g>
      ))}
      {roots.map((r, i) => (
        <circle key={i} className="root-tip" cx={r.tip[0]} cy={r.tip[1]} r="14" fill="url(#tip-glow)" />
      ))}
    </svg>
  )
}
