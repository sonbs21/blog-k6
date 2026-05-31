'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { LogOut, PenLine, LayoutList, User, ChevronDown, Search } from 'lucide-react'

const NAV_LINKS = [
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, isAuthor } = useAuthStore()
  const logout = useLogout()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="site-container flex h-14 items-center justify-between">

        <Link
          href="/"
          className="font-semibold text-sm tracking-tight text-foreground hover:text-accent transition-colors"
        >
          Travel Stories
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center mr-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  isActive(href)
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <Link
            href="/search"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              {isAuthor() && (
                <Link
                  href="/author/posts/new"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-accent text-accent-foreground px-3 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                >
                  <PenLine className="h-3 w-3" />
                  Write
                </Link>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-1.5 py-1 hover:bg-muted transition-colors"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold uppercase">
                    {user?.display_name?.[0] ?? '?'}
                  </span>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-150', open && 'rotate-180')} />
                </button>

                {open && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-background shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold truncate">{user?.display_name}</p>
                      <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Personal profile
                      </Link>
                      {isAuthor() && (
                        <Link
                          href="/author/posts"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <LayoutList className="h-4 w-4 text-muted-foreground" />
                          Manage posts
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => { logout.mutate(); setOpen(false) }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
