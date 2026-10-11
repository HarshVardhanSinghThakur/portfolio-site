import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Panel } from '../components/Panel'
import { stars } from '../content/profile'
import { gsap, ScrollTrigger } from '../engine/gsap'
import { reducedMotion } from '../engine/motion'
import { useChapterTheme } from '../engine/useChapterTheme'

const lines = stars.map((s, i) => `${i ? 'L' : 'M'}${s.x * 2} ${s.y}`).join(' ')
const cross = `M${stars[1].x * 2} ${stars[1].y} L${stars[3].x * 2} ${stars[3].y}`

export function Sky() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  useChapterTheme(ref, 'sky')

  useEffect(() => {
    if (reducedMotion) return
    const st = ScrollTrigger.create({
      trigger: '.sky__stage',
      start: 'top 75%',
      once: true,
      onEnter: () =>
        gsap
          .timeline()
          .to('.sky__line', { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
          .to('.star__btn', { opacity: 1, scale: 1, duration: 0.7, stagger: 0.18, ease: 'back.out(2)' }, 0.1),
    })
    return () => st.kill()
  }, [])

  const star = stars[active]

  return (
    <section id="sky" ref={ref} className="depth sky">
      <header className="depth__head">
        <h2 className="depth__title">Sky</h2>
        <p className="depth__line">I started with the models.</p>
      </header>

      <div className="sky__grid">
        <div className="sky__stage">
          <svg viewBox="0 0 200 100" className="sky__svg" aria-hidden="true">
            <path className="sky__line" d={lines} pathLength={1} />
            <path className="sky__line sky__line--faint" d={cross} pathLength={1} />
          </svg>
          {stars.map((s, i) => (
            <div key={s.label} className="star" data-side={s.x >= 85 ? 'l' : 'r'} style={{ '--x': `${s.x}%`, '--y': `${s.y}%` } as CSSProperties}>
              <button
                type="button"
                className="star__btn"
                aria-pressed={active === i}
                onClick={() => setActive(i)}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <span className="star__glyph" />
                <span className="star__label">{s.label}</span>
              </button>
            </div>
          ))}
        </div>

        <Panel from="right" tone="terminal" className="sky__detail">
          <div key={active} className="detail">
            <p className="detail__where">{star.where}</p>
            <h3 className="detail__title">{star.label}</h3>
            <p>{star.text}</p>
          </div>
        </Panel>
      </div>
    </section>
  )
}
