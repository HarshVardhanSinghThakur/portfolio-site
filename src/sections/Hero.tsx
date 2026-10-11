import { useLayoutEffect, useRef } from 'react'
import { KineticText } from '../components/KineticText'
import { Landscape } from '../components/Landscape'
import { profile } from '../content/profile'
import { gsap } from '../engine/gsap'
import { reducedMotion } from '../engine/motion'
import { useChapterTheme } from '../engine/useChapterTheme'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  useChapterTheme(ref, 'night')

  // The one orchestrated moment on load: the name rises out of the dark.
  useLayoutEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.35 })
      tl.from('[data-in="role"]', { autoAlpha: 0, y: 12, duration: 0.8, ease: 'power2.out' })
        .from('.kt__c', { yPercent: 55, autoAlpha: 0, duration: 1.1, stagger: 0.05, ease: 'power3.out' }, '-=0.4')
        .from('[data-in="tag"]', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'power2.out' }, '-=0.6')
        .from('[data-in="about"]', { autoAlpha: 0, duration: 0.9 }, '-=0.5')
        .from('[data-in="descend"]', { autoAlpha: 0, duration: 1 }, '-=0.4')
      tl.eventCallback('onComplete', () => {
        gsap.set('.kt__c, [data-in]', { clearProps: 'transform,opacity,visibility' })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="start" ref={ref} className="hero">
      <Landscape />

      <div className="hero__top">
        <span className="seal" aria-hidden="true">
          影
        </span>
        <p className="hero__role" data-in="role">
          {profile.role}
        </p>
      </div>

      <h1 className="hero__name">
        <KineticText text={profile.name} />
        <KineticText text={profile.surname} className="hero__surname" />
      </h1>

      <p className="hero__tag" data-in="tag">
        {profile.tagline}
      </p>
      <p className="hero__about" data-in="about">
        {profile.about}
      </p>

      <ol className="descend" aria-label="Sections below" data-in="descend">
        <li>Sky</li>
        <li>Ground</li>
        <li>Roots</li>
      </ol>
    </section>
  )
}
