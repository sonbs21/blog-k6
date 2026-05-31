import Link from 'next/link'
import { Compass } from 'lucide-react'

const links = {
  Explore: [
    { label: 'All Stories', href: '/posts' },
    { label: 'Search', href: '/search' },
  ],
  Account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Create Account', href: '/register' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="container-editorial py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold text-white">Travel Stories</span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-400 max-w-xs">
              A community of travelers sharing stories, discoveries, and adventures from every corner of the world.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-500">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}
                      className="text-sm text-stone-400 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-800 pt-8">
          <p className="text-xs text-stone-600">
            © {new Date().getFullYear()} Travel Stories. All rights reserved.
          </p>
          <p className="text-xs text-stone-600">
            Made with ❤ for explorers everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
