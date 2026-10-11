import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../engine/gsap'
import { reducedMotion } from '../engine/motion'

const W = 2200
const H = 560

const peaks = (seed: number, base: number, amp: number) => {
  let d = `M0 ${H}`
  for (let x = 0; x <= W; x += 12) {
    const y = base - amp * (0.6 * Math.abs(Math.sin(x * 0.004 + seed)) + 0.4 * Math.abs(Math.sin(x * 0.013 + seed * 1.7)))
    d += ` L${x} ${y.toFixed(1)}`
  }
  return `${d} L${W} ${H} Z`
}

const hills = (seed: number, base: number, amp: number) => {
  let d = `M0 ${H}`
  for (let x = 0; x <= W; x += 12) {
    const y = base - amp * (0.5 * Math.sin(x * 0.003 + seed) + 0.3 * Math.sin(x * 0.009 + seed * 2.3) + 0.2 * Math.sin(x * 0.02 + seed * 4.1))
    d += ` L${x} ${y.toFixed(1)}`
  }
  return `${d} L${W} ${H} Z`
}

const pagoda = (cx: number, by: number, s: number) => {
  let d = ''
  let y = by
  for (let i = 0; i < 5; i++) {
    const w = (46 - i * 7) * s
    const bh = 22 * s
    const rh = 10 * s
    d += `M${cx - w * 0.62} ${y} h${w * 1.24} v${-bh} h${-w * 1.24} Z `
    y -= bh
    d += `M${cx - w - 8 * s} ${y - 6 * s} Q${cx - w * 0.4} ${y + 4 * s} ${cx} ${y - rh} Q${cx + w * 0.4} ${y + 4 * s} ${cx + w + 8 * s} ${y - 6 * s} L${cx + w * 0.8} ${y + 3 * s} L${cx - w * 0.8} ${y + 3 * s} Z `
    y -= rh * 0.6
  }
  return `${d}M${cx - 1.5 * s} ${y} h${3 * s} v${-34 * s} h${-3 * s} Z`
}

const torii = (cx: number, by: number, s: number) => {
  const top = by - 160 * s
  const pw = 14 * s
  return [
    // pillars with slight taper
    `M${cx - 70 * s} ${by} l${3 * s} ${-160 * s} h${pw} l${-3 * s} ${160 * s} Z`,
    `M${cx + 56 * s} ${by} l${3 * s} ${-160 * s} h${pw} l${-3 * s} ${160 * s} Z`,
    // lower beam (nuki)
    `M${cx - 80 * s} ${top + 42 * s} h${160 * s} v${10 * s} h${-160 * s} Z`,
    // upper beam (kasagi) with curve
    `M${cx - 110 * s} ${top - 8 * s} Q${cx} ${top + 14 * s} ${cx + 110 * s} ${top - 8 * s} L${cx + 104 * s} ${top + 12 * s} Q${cx} ${top + 28 * s} ${cx - 104 * s} ${top + 12 * s} Z`,
    // shimenawa rope draping between pillars
    `M${cx - 60 * s} ${top + 52 * s} Q${cx - 30 * s} ${top + 68 * s} ${cx} ${top + 56 * s} Q${cx + 30 * s} ${top + 44 * s} ${cx + 60 * s} ${top + 52 * s}`,
  ].join(' ')
}

// Detailed bamboo: visible nodes, varying thickness, drooping leaf clusters
const bamboo = (x0: number, dir: 1 | -1, count: number) => {
  let d = ''
  for (let i = 0; i < count; i++) {
    const x = x0 + dir * i * 38 + (i % 2) * 12
    const lean = dir * (3 + (i % 3) * 2.5)
    const thick = 5 + (i % 3) * 2.5
    const h = 340 + (i % 4) * 60 + (i % 2) * 30
    // main stalk
    d += `M${x} ${H} L${x + lean} ${H - h} l${thick} 0 L${x + thick + 1} ${H} Z `
    // nodes (horizontal rings on the stalk)
    const segments = 6 + (i % 3)
    for (let j = 1; j < segments; j++) {
      const ny = H - (h * j) / segments
      const nx = x + (lean * j) / segments
      d += `M${nx - 1} ${ny} h${thick + 3} v${2.5} h${-thick - 3} Z `
    }
    // leaf clusters at nodes
    for (let j = 2; j < segments; j += 2) {
      const ny = H - (h * j) / segments
      const nx = x + (lean * j) / segments + thick / 2
      const ld = j % 4 === 0 ? dir : -dir
      for (let k = 0; k < 3; k++) {
        const angle = ld * (15 + k * 22)
        const len = 30 + k * 14
        const droop = 12 + k * 8
        d += `M${nx} ${ny - k * 4} q${angle} ${-len * 0.3} ${angle * 1.4} ${droop} q${-angle * 0.3} ${-droop * 0.6} ${-angle * 1.4} ${-droop} Z `
      }
    }
  }
  return d
}

// Stone lantern (ishidoro)
const stoneLantern = (cx: number, by: number, s: number) =>
  [
    // base
    `M${cx - 14 * s} ${by} h${28 * s} v${-6 * s} h${-28 * s} Z`,
    // shaft
    `M${cx - 5 * s} ${by - 6 * s} h${10 * s} v${-30 * s} h${-10 * s} Z`,
    // firebox
    `M${cx - 12 * s} ${by - 36 * s} h${24 * s} v${-16 * s} h${-24 * s} Z`,
    // roof
    `M${cx - 20 * s} ${by - 52 * s} L${cx} ${by - 68 * s} L${cx + 20 * s} ${by - 52 * s} Z`,
    // finial
    `M${cx - 2 * s} ${by - 68 * s} h${4 * s} v${-8 * s} h${-4 * s} Z`,
  ].join(' ')

const LAYERS = [
  { id: 'far', shift: 12, drift: 130, hScroll: 80 },
  { id: 'mid', shift: 24, drift: 80, hScroll: 50 },
  { id: 'near', shift: 44, drift: 35, hScroll: 25 },
  { id: 'fg', shift: 80, drift: 0, hScroll: 0 },
]

const grad = (id: string, top: string, bottom: string) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor={top} />
    <stop offset="1" stopColor={bottom} />
  </linearGradient>
)

export function Landscape() {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<SVGSVGElement>('.layer')
      gsap.from(layers, { yPercent: 16, autoAlpha: 0, duration: 1.7, ease: 'power3.out', stagger: 0.16, delay: 0.1 })

      layers.forEach((layer, i) => {
        // vertical drift on scroll
        gsap.to(layer, {
          y: LAYERS[i].drift,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        // horizontal scroll parallax (wider layers slide more)
        if (LAYERS[i].hScroll > 0) {
          gsap.to(layer, {
            x: -LAYERS[i].hScroll,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
          })
        }
      })

      const moveX = layers.map((l) => gsap.quickTo(l, 'x', { duration: 1.2, ease: 'power3.out' }))
      const onMove = (e: PointerEvent) => {
        const n = e.clientX / window.innerWidth - 0.5
        moveX.forEach((to, i) => to(-n * LAYERS[i].shift))
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      return () => window.removeEventListener('pointermove', onMove)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="landscape" aria-hidden="true">
      {/* far mountains */}
      <svg className="layer" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <defs>
          {grad('g-far', '#2a1822', '#0d1018')}
          {grad('g-mid', '#120f17', '#06070b')}
          {grad('g-near', '#0a0c12', '#030305')}
        </defs>
        <path d={peaks(1.3, 340, 200)} fill="url(#g-far)" />
      </svg>

      {/* mid hills with pagoda */}
      <svg className="layer" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <path d={hills(2.1, 410, 75)} fill="url(#g-mid)" />
        <path d={pagoda(1540, 415, 1.15)} fill="url(#g-mid)" />
      </svg>

      {/* near hills with small pagoda */}
      <svg className="layer" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <path d={hills(4.7, 465, 50)} fill="url(#g-near)" />
        <path d={pagoda(520, 470, 0.65)} fill="url(#g-near)" />
      </svg>

      {/* foreground: detailed bamboo, torii, stone lanterns, path */}
      <svg className="layer" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="lantern-glow">
            <stop offset="0" stopColor="#ffb06a" />
            <stop offset="0.3" stopColor="#ff6a2e" />
            <stop offset="1" stopColor="#ff6a2e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ground */}
        <path d={`M0 ${H} L0 ${H - 30} Q${W / 2} ${H - 58} ${W} ${H - 30} L${W} ${H} Z`} fill="#020204" />

        {/* stone path winding through */}
        <ellipse cx="980" cy={H - 12} rx="180" ry="14" fill="#0a0a10" stroke="#14121a" strokeWidth="1" />
        <ellipse cx="1080" cy={H - 8} rx="60" ry="8" fill="#060608" />
        <ellipse cx="880" cy={H - 10} rx="50" ry="7" fill="#060608" />

        {/* bamboo groves - left side, wider and more detailed */}
        <path d={bamboo(-40, 1, 9)} fill="#020204" />
        {/* bamboo groves - right side */}
        <path d={bamboo(W + 40, -1, 9)} fill="#020204" />

        {/* torii gate, centered */}
        <path d={torii(1020, H - 20, 1.6)} fill="#020204" />

        {/* stone lanterns flanking the path */}
        <path d={stoneLantern(840, H - 20, 1.2)} fill="#0a0a10" stroke="#14121a" strokeWidth="1.5" />
        <path d={stoneLantern(1200, H - 20, 1.2)} fill="#0a0a10" stroke="#14121a" strokeWidth="1.5" />

        {/* lantern glows */}
        <circle cx="840" cy={H - 64} r="32" fill="url(#lantern-glow)" opacity="0.6" />
        <circle cx="1200" cy={H - 64} r="32" fill="url(#lantern-glow)" opacity="0.6" />
        <circle cx="840" cy={H - 64} r="5" fill="#ffb06a" />
        <circle cx="1200" cy={H - 64} r="5" fill="#ffb06a" />

        {/* torii lanterns */}
        <circle cx="944" cy="340" r="36" fill="url(#lantern-glow)" opacity="0.5" />
        <circle cx="1096" cy="340" r="36" fill="url(#lantern-glow)" opacity="0.5" />
        <circle cx="944" cy="340" r="5" fill="#ffb06a" />
        <circle cx="1096" cy="340" r="5" fill="#ffb06a" />

        {/* hanging wind chimes from torii */}
        <line x1="990" y1="355" x2="990" y2="385" stroke="#14121a" strokeWidth="1" />
        <rect x="986" y="385" width="8" height="12" rx="2" fill="#0a0a10" stroke="#14121a" strokeWidth="1" />
        <line x1="1050" y1="355" x2="1050" y2="378" stroke="#14121a" strokeWidth="1" />
        <rect x="1046" y="378" width="8" height="12" rx="2" fill="#0a0a10" stroke="#14121a" strokeWidth="1" />
      </svg>
    </div>
  )
}
