import type { Metadata } from 'next'
import Link from 'next/link'
import { Compass } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign In' }

interface Props { searchParams: { registered?: string } }

export default function LoginPage({ searchParams }: Props) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between bg-stone-900 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-forest-900/50 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-stone-800/70 blur-3xl" />
          <svg className="absolute inset-0 h-full w-full opacity-5">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <Link href="/" className="relative flex items-center gap-2 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-600 text-white">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold text-white">Travel Stories</span>
        </Link>

        <div className="relative">
          <blockquote className="font-display text-3xl font-bold leading-snug text-white mb-6">
            &ldquo;The world is a book, and those who do not travel read only one page.&rdquo;
          </blockquote>
          <p className="text-stone-400 text-sm">— Saint Augustine</p>
        </div>

        <p className="relative text-xs text-stone-600">
          © {new Date().getFullYear()} Travel Stories
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-16 sm:px-12">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-white">
            <Compass className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold text-stone-900">Travel Stories</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Welcome back</h1>
            <p className="text-stone-500 text-sm">Sign in to continue your journey.</p>
          </div>
          <LoginForm registeredSuccess={searchParams.registered === '1'} />
        </div>
      </div>
    </div>
  )
}
