import type { Metadata } from 'next'
import Link from 'next/link'
import { Compass, Globe, PenLine, Heart } from 'lucide-react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: 'Create Account' }

const perks = [
  { icon: Globe, text: 'Save your favorite destinations and stories' },
  { icon: PenLine, text: 'Share your own travel experiences' },
  { icon: Heart, text: 'Connect with a community of explorers' },
]

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between bg-stone-900 p-12 relative overflow-hidden">
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

        <div className="relative space-y-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-white mb-3">
              Join a community of travelers
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Share your adventures, discover new destinations, and connect with explorers worldwide.
            </p>
          </div>
          <ul className="space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900/60 border border-forest-800">
                  <Icon className="h-4 w-4 text-forest-400" />
                </div>
                <span className="text-sm text-stone-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-stone-600">
          © {new Date().getFullYear()} Travel Stories
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-16 sm:px-12">
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-white">
            <Compass className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold text-stone-900">Travel Stories</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Create account</h1>
            <p className="text-stone-500 text-sm">Free forever. Start sharing your journey today.</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
