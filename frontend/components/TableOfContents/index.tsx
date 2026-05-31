'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0% -70% 0%', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav aria-label="Table of contents" className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        On this page
      </p>
      {headings.map(({ id, text, level }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className={cn(
            'block text-sm leading-relaxed transition-colors py-0.5',
            level === 3 && 'pl-3',
            level === 4 && 'pl-6',
            activeId === id
              ? 'text-accent font-medium'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {text}
        </a>
      ))}
    </nav>
  )
}
