'use client'
import Link from 'next/link'
import { Compass, PenLine, LogOut, Search, X, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, isAuthenticated, isAuthor } = useAuthStore()
  const logout = useLogout()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchValue.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchOpen(false)
      setSearchValue('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="container-editorial flex h-16 items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-white transition-transform group-hover:scale-105">
            <Compass className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-stone-900 hidden sm:block">
            Travel Stories
          </span>
        </Link>

        {/* Search bar (desktop) */}
        {searchOpen ? (
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <input
              autoFocus
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search destinations, stories..."
              className="flex-1 bg-transparent py-1.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
            />
            <button type="button" onClick={() => { setSearchOpen(false); setSearchValue('') }}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <nav className="flex-1 hidden md:flex items-center gap-6 ml-4">
            <Link href="/posts" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Explore
            </Link>
          </nav>
        )}

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {!searchOpen && (
            <button onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors">
              <Search className="h-4 w-4" />
            </button>
          )}

          {isAuthenticated ? (
            <>
              {isAuthor() && (
                <Link href="/author/posts/new"
                  className="hidden sm:flex items-center gap-1.5 rounded-full bg-forest-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-forest-800 transition-colors ml-1">
                  <PenLine className="h-3.5 w-3.5" />
                  Write
                </Link>
              )}
              <div className="flex items-center gap-1 ml-1">
                <Link href="/profile"
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-300 transition-colors uppercase">
                  {user?.display_name?.[0] ?? '?'}
                </Link>
                <button onClick={() => logout.mutate()}
                  className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  title="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link href="/login"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link href="/register"
                className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-stone-700 transition-colors">
                Join free
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full text-stone-500 hover:bg-stone-100 transition-colors ml-1">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-100 bg-stone-50 px-4 py-4 flex flex-col gap-3">
          <Link href="/posts" onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-stone-700">Explore</Link>
          {isAuthenticated ? (
            <>
              {isAuthor() && (
                <Link href="/author/posts/new" onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-forest-700">Write a post</Link>
              )}
              <Link href="/profile" onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-stone-700">{user?.display_name}</Link>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-stone-700">Sign in</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-forest-700">Create account</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
