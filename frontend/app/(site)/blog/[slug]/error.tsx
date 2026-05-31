'use client'
import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PostError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="site-container py-24 text-center">
      <p className="text-4xl font-bold mb-3">404</p>
      <p className="text-muted-foreground mb-6 text-sm">
        This post doesn&apos;t exist or couldn&apos;t be loaded.
      </p>
      <div className="flex justify-center gap-3">
        <button onClick={reset}
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity">
          Try again
        </button>
        <Link href="/blog"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">
          Back to blog
        </Link>
      </div>
    </div>
  )
}
