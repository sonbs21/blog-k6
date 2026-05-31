import Link from 'next/link'

const SOCIAL = [
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'RSS', href: '/rss.xml' },
]

export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="site-container flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Travel Stories
        </p>
        <nav className="flex items-center gap-4">
          {SOCIAL.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
