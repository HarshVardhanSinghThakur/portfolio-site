import { useRef } from 'react'
import { profile } from '../content/profile'
import { useChapterTheme } from '../engine/useChapterTheme'

export function Hello() {
  const ref = useRef<HTMLElement>(null)
  useChapterTheme(ref, 'mist')

  return (
    <section id="hello" ref={ref} className="hello">
      <h2 className="hello__title">Say hello.</h2>
      <ul className="hello__links">
        <li>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </li>
        <li>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </li>
      </ul>
    </section>
  )
}
