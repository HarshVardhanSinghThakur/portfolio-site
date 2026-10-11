import { gsap } from './gsap'

interface RGB {
  r: number
  g: number
  b: number
}

const rgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16)
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
}

export const themes = {
  night: { top: '#06070d', bottom: '#2a0d12', glow: '#ff4a2e', moon: '#ffa36b', moonY: 0.62, moonR: 0.17 },
  sky: { top: '#04050b', bottom: '#1c0e22', glow: '#c2395a', moon: '#ffd0a8', moonY: 0.9, moonR: 0.1 },
  shrine: { top: '#05060b', bottom: '#2a0d0f', glow: '#b2281f', moon: '#e8714a', moonY: 0.74, moonR: 0.12 },
  roots: { top: '#05070a', bottom: '#1b0d05', glow: '#c2561f', moon: '#ff9a55', moonY: -0.5, moonR: 0.1 },
  mist: { top: '#050912', bottom: '#122436', glow: '#3d7fa8', moon: '#bcd4e6', moonY: 0.82, moonR: 0.1 },
} as const

export type ThemeName = keyof typeof themes

export const scene = {
  mood: 0,
  scroll: 0,
  moonY: themes.night.moonY,
  moonR: themes.night.moonR,
  top: rgb(themes.night.top),
  bottom: rgb(themes.night.bottom),
  glow: rgb(themes.night.glow),
  moon: rgb(themes.night.moon),
}

export function setTheme(name: ThemeName) {
  const t = themes[name]
  const opts = { duration: 1.4, ease: 'power2.inOut', overwrite: 'auto' } as const
  gsap.to(scene, { moonY: t.moonY, moonR: t.moonR, ...opts })
  gsap.to(scene.top, { ...rgb(t.top), ...opts })
  gsap.to(scene.bottom, { ...rgb(t.bottom), ...opts })
  gsap.to(scene.glow, { ...rgb(t.glow), ...opts })
  gsap.to(scene.moon, { ...rgb(t.moon), ...opts })
}
