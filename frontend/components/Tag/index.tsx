import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TagProps {
  name: string
  href?: string
  className?: string
  size?: 'sm' | 'md'
}

const palette: Record<string, string> = {
  travel:  'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  asia:    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  europe:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  code:    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  dev:     'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  tech:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  design:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  life:    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  food:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

function getColor(tag: string): string {
  return palette[tag.toLowerCase()] ?? 'bg-muted text-muted-foreground'
}

export function Tag({ name, href, className, size = 'sm' }: TagProps) {
  const base = cn(
    'inline-flex items-center rounded-full font-medium transition-colors',
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    getColor(name),
    href && 'hover:opacity-80 cursor-pointer',
    className
  )

  if (href) return <Link href={href} className={base}>{name}</Link>
  return <span className={base}>{name}</span>
}
