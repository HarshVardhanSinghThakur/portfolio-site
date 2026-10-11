import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { gsap, ScrollTrigger } from './gsap'
import { reducedMotion } from './motion'
import { scene } from './scene'
import { FRAG, VERT } from './shader'

const MIN_QUALITY = 0.45
const SLOW_FRAME_MS = 22
const SAMPLE_FRAMES = 45

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const canvas = canvasRef.current!

    if (reducedMotion) {
      root.classList.add('static-bg')
      return
    }

    const renderer = new Renderer({ canvas, alpha: false, antialias: false, powerPreference: 'high-performance' })
    const gl = renderer.gl
    if (!gl) {
      root.classList.add('static-bg')
      return
    }

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uPointer: { value: [0.5, 0.5] },
        uScroll: { value: 0 },
        uMood: { value: 0 },
        uMoonY: { value: 0.6 },
        uMoonR: { value: 0.17 },
        uTop: { value: [0, 0, 0] },
        uBottom: { value: [0, 0, 0] },
        uGlow: { value: [0, 0, 0] },
        uMoon: { value: [0, 0, 0] },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
    const u = program.uniforms

    let quality = window.matchMedia('(pointer: coarse)').matches ? 0.6 : 0.85
    const resize = () => {
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 1.5) * quality
      renderer.setSize(window.innerWidth, window.innerHeight)
      u.uRes.value = [window.innerWidth, window.innerHeight]
    }
    resize()
    window.addEventListener('resize', resize)

    const target = [0.5, 0.5]
    const onPointer = (e: PointerEvent) => {
      target[0] = e.clientX / window.innerWidth
      target[1] = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const progress = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => (scene.scroll = self.progress),
    })

    const debug = new URLSearchParams(location.search).has('debug')
    const hud = debug ? document.body.appendChild(document.createElement('div')) : null
    if (hud) hud.className = 'debug-hud'

    let frames = 0
    let acc = 0
    const tick = (time: number, deltaMs: number) => {
      const pointer = u.uPointer.value as number[]
      pointer[0] += (target[0] - pointer[0]) * 0.08
      pointer[1] += (target[1] - pointer[1]) * 0.08

      u.uTime.value = time
      u.uScroll.value = scene.scroll
      u.uMood.value = scene.mood
      u.uMoonY.value = scene.moonY
      u.uMoonR.value = scene.moonR
      const set = (v: { value: unknown }, c: { r: number; g: number; b: number }) => {
        const a = v.value as number[]
        a[0] = c.r
        a[1] = c.g
        a[2] = c.b
      }
      set(u.uTop, scene.top)
      set(u.uBottom, scene.bottom)
      set(u.uGlow, scene.glow)
      set(u.uMoon, scene.moon)

      renderer.render({ scene: mesh })

      // Step the render scale down on slow GPUs; never back up, to avoid flapping.
      acc += deltaMs
      if (++frames === SAMPLE_FRAMES) {
        const avg = acc / frames
        if (hud) hud.textContent = `${Math.round(1000 / avg)} fps | render scale ${quality.toFixed(2)}`
        if (avg > SLOW_FRAME_MS && quality > MIN_QUALITY) {
          quality = Math.max(MIN_QUALITY, quality - 0.15)
          resize()
        }
        frames = 0
        acc = 0
      }
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      progress.kill()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      hud?.remove()
    }
  }, [])

  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />
}
