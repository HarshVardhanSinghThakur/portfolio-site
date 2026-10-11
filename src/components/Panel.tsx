import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '../engine/gsap'
import { reducedMotion } from '../engine/motion'

type From = 'left' | 'right' | 'top' | 'bottom'

const START: Record<From, string> = {
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  top: 'inset(0% 0% 100% 0%)',
  bottom: 'inset(100% 0% 0% 0%)',
}

interface Props {
  children: ReactNode
  from?: From
  tone?: 'dark' | 'ember' | 'blood' | 'terminal'
  tilt?: number
  className?: string
}

// The frame is always there; the scene wipes in like ink when it scrolls into view.
export function Panel({ children, from = 'left', tone = 'dark', tilt = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const fill = ref.current!.firstElementChild as HTMLElement
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.fromTo(fill, { clipPath: START[from] }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.out' }),
    })
    return () => st.kill()
  }, [from])

  return (
    <div
      ref={ref}
      className={`panel panel--${tone} ${className}`}
      data-from={from}
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
    >
      <div className="panel__fill">{children}</div>
    </div>
  )
}
