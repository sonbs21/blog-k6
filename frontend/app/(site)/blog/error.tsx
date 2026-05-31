'use client'
import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BlogError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="site-container py-24 text-center">
      <p className="text-2xl font-bold mb-2">Something went wrong</p>
      <p className="text-muted-foreground mb-6 text-sm">{error.message}</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Try again
        </button>
        <Link href="/"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">
          Go home
        </Link>
      </div>
    </div>
  )
}
