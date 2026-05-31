'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useState, useTransition } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  defaultValue?: string
  className?: string
  size?: 'default' | 'lg'
  placeholder?: string
}

export function SearchBar({
  defaultValue = '',
  className,
  size = 'default',
  placeholder = 'Search destinations, stories...',
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Sync value when URL param changes (e.g. browser back)
  useEffect(() => {
    setValue(searchParams.get('q') ?? defaultValue)
  }, [searchParams, defaultValue])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed.length >= 2) {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      })
    }
  }

  function handleClear() {
    setValue('')
    startTransition(() => router.push('/search'))
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative flex items-center', className)}>
      {isPending ? (
        <Loader2 className={cn(
          'absolute pointer-events-none animate-spin text-stone-400',
          size === 'lg' ? 'h-5 w-5 left-4' : 'h-4 w-4 left-3.5',
        )} />
      ) : (
        <Search className={cn(
          'absolute pointer-events-none text-stone-400',
          size === 'lg' ? 'h-5 w-5 left-4' : 'h-4 w-4 left-3.5',
        )} />
      )}

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-xl border shadow-sm transition-all',
          'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100',
          'placeholder:text-stone-400',
          'focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500',
          size === 'lg'
            ? 'py-3.5 pl-11 pr-11 text-base border-stone-300 dark:border-stone-700'
            : 'py-2.5 pl-9 pr-8 text-sm border-stone-200 dark:border-stone-700',
        )}
      />

      {value && !isPending && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors',
            size === 'lg' ? 'right-4' : 'right-3',
          )}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  )
}
