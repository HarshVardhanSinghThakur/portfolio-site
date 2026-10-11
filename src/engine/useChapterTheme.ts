import { useEffect, type RefObject } from 'react'
import { ScrollTrigger } from './gsap'
import { setTheme, type ThemeName } from './scene'

export function useChapterTheme(ref: RefObject<HTMLElement | null>, name: ThemeName) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 60%',
      onToggle: (self) => self.isActive && setTheme(name),
    })
    return () => st.kill()
  }, [ref, name])
}
