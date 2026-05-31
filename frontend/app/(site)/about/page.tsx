import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = { title: 'About' }

const SKILLS = [
  { category: 'Languages', items: ['TypeScript', 'Python', 'Go'] },
  { category: 'Frontend', items: ['Next.js', 'React', 'Tailwind CSS'] },
  { category: 'Backend', items: ['FastAPI', 'PostgreSQL', 'Redis'] },
  { category: 'Infra', items: ['AWS', 'Terraform', 'Docker'] },
]

const TIMELINE = [
  {
    year: '2024',
    items: [
      'Started building Travel Stories',
      'Visited 12 countries in 8 months',
      'Joined remote-first startup as senior engineer',
    ],
  },
  {
    year: '2023',
    items: [
      'First year fully location-independent',
      'Spoke at VietJS Hanoi',
      'Shipped open-source Terraform modules',
    ],
  },
  {
    year: '2022',
    items: [
      'Quit the office job',
      'Bought a one-way ticket to Tokyo',
      'Started writing publicly',
    ],
  },
  {
    year: 'Earlier',
    items: [
      '5 years at product companies in Hanoi',
      'CS degree from Hanoi University',
    ],
  },
]

const LINKS = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'Twitter / X', href: 'https://twitter.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Email', href: 'mailto:hello@example.com' },
]

export default function AboutPage() {
  return (
    <div className="site-container py-12 sm:py-16">
      <div className="prose-container">

        {/* Intro */}
        <section className="mb-14">
          <h1 className="text-3xl font-bold tracking-tight mb-6">About</h1>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              I&apos;m <span className="font-medium text-foreground">Son Bui</span> — a software engineer
              and traveler based somewhere between Hanoi and everywhere else.
            </p>
            <p>
              I&apos;ve been writing code professionally for 7+ years, mostly on web products.
              In 2022 I traded a permanent address for a carry-on bag and haven&apos;t looked back.
              I work remotely, travel slowly, and write about both on this blog.
            </p>
            <p>
              I believe the best code and the best travel share something: they both require slowing
              down, paying attention, and being willing to get lost on purpose.
            </p>
          </div>
        </section>

        {/* Skills */}
        <section className="mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Technical skills
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {SKILLS.map(({ category, items }) => (
              <div key={category}>
                <p className="text-xs font-semibold text-foreground mb-2">{category}</p>
                <ul className="space-y-1">
                  {items.map(item => (
                    <li key={item} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Timeline
          </h2>
          <div className="space-y-8">
            {TIMELINE.map(({ year, items }) => (
              <div key={year} className="grid sm:grid-cols-[80px_1fr] gap-2 sm:gap-6">
                <p className="text-sm font-semibold text-foreground pt-0.5">{year}</p>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Links */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Find me online
          </h2>
          <div className="flex flex-wrap gap-3">
            {LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                {label}
                {href.startsWith('http') && <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
