import { useEffect } from 'react'
import { operator } from './api/store'
import { ChapterNav } from './components/ChapterNav'
import { OutageBanner } from './components/OutageBanner'
import { chapters } from './content/profile'
import { ShaderBackground } from './engine/ShaderBackground'
import { ScrollTrigger } from './engine/gsap'
import { bindMood } from './engine/mood'
import { initScroll } from './engine/scroll'
import { Ground } from './sections/Ground'
import { Hello } from './sections/Hello'
import { Hero } from './sections/Hero'
import { Roots } from './sections/Roots'
import { Sky } from './sections/Sky'

export function App() {
  useEffect(() => initScroll(), [])
  useEffect(() => bindMood(), [])
  useEffect(() => operator.recordVisit(), [])

  // Webfonts change text metrics, so measure scroll positions again once loaded.
  useEffect(() => {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <ShaderBackground />
      <OutageBanner />
      <ChapterNav items={chapters} />
      <main>
        <Hero />
        <Sky />
        <Ground />
        <Roots />
        <Hello />
      </main>
    </>
  )
}
