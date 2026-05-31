import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy')
}

export function formatRelativeDate(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

/** Real reading time from full content */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

/** Estimated reading time from description (used on list pages) */
export function estimateReadingTime(description: string): number {
  const words = description.trim().split(/\s+/).length
  // Assume post is ~8x the description length
  return Math.max(1, Math.ceil((words * 8) / 200))
}
