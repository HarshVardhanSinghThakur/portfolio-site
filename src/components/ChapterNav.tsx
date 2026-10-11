import { useEffect, useState } from 'react'
import { scrollToId } from '../engine/scroll'

interface Item {
  id: string
  label: string
}

export function ChapterNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0].id)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [items])

  return (
    <nav className="chapter-nav" aria-label="Chapters">
      <ul>
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                scrollToId(id)
              }}
            >
              <span className="chapter-nav__label">{label}</span>
              <span className="chapter-nav__dot" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
