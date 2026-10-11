import { useRef, type CSSProperties } from 'react'
import { services } from '../content/profile'
import { useChapterTheme } from '../engine/useChapterTheme'

function Lantern() {
  return (
    <svg viewBox="0 0 60 80" className="lantern" aria-hidden="true">
      <defs>
        <radialGradient id="lantern-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd09a" />
          <stop offset="0.55" stopColor="#ff7b3a" />
          <stop offset="1" stopColor="#b2281f" />
        </radialGradient>
      </defs>
      <rect x="20" y="4" width="20" height="7" fill="#120b0b" />
      <path d="M14 11 H46 Q57 38 46 65 H14 Q3 38 14 11 Z" fill="url(#lantern-glow)" stroke="#120b0b" strokeWidth="2" />
      <path d="M11 27 H49 M9 38 H51 M11 49 H49" stroke="#120b0b" strokeWidth="1.5" opacity="0.55" />
      <rect x="20" y="65" width="20" height="7" fill="#120b0b" />
      <path d="M30 72 V79" stroke="#120b0b" strokeWidth="2" />
    </svg>
  )
}

export function Ground() {
  const ref = useRef<HTMLElement>(null)
  useChapterTheme(ref, 'shrine')

  return (
    <section id="ground" ref={ref} className="depth ground">
      <header className="depth__head">
        <h2 className="depth__title">Ground</h2>
        <p className="depth__line">A model on its own helps no one. Between it and a person there is always a service.</p>
      </header>

      <ul className="lanterns">
        {services.map((s) => (
          <li key={s.title} className="lanterns__item" style={{ '--drop': `${s.drop}px` } as CSSProperties}>
            <span className="lanterns__string" />
            <Lantern />
            <h3 className="lanterns__title">{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
