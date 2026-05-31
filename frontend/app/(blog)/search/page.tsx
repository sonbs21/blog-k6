import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { api } from '@/lib/api'
import { PostCard } from '@/components/blog/PostCard'
import { SearchBar } from '@/components/blog/SearchBar'
import type { PaginatedResponse, PostListItem } from '@/types'

interface Props { searchParams: { q?: string; page?: string } }

export function generateMetadata({ searchParams }: Props): Metadata {
  return { title: searchParams.q ? `"${searchParams.q}" — Search` : 'Search Stories' }
}

async function getResults(q: string, page: number): Promise<PaginatedResponse<PostListItem> | null> {
  if (q.length < 2) return null
  try {
    const { data } = await api.get<PaginatedResponse<PostListItem>>('/search', {
      params: { q, page, limit: 12 },
    })
    return data
  } catch {
    return null
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q ?? ''
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const results = await getResults(q, page)

  function pageUrl(p: number) {
    return `/search?q=${encodeURIComponent(q)}&page=${p}`
  }

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mb-6">
          Search
        </h1>
        <SearchBar defaultValue={q} size="lg" className="max-w-2xl" />
      </div>

      {/* Results */}
      {results ? (
        <>
          <p className="mb-6 text-sm text-stone-500 dark:text-stone-400">
            {results.total === 0 ? (
              <>No results for &ldquo;<span className="font-medium text-foreground">{q}</span>&rdquo;</>
            ) : (
              <>
                Found{' '}
                <strong className="text-stone-800 dark:text-stone-200">{results.total}</strong>
                {' '}{results.total === 1 ? 'story' : 'stories'} for &ldquo;
                <span className="font-medium text-foreground">{q}</span>&rdquo;
              </>
            )}
          </p>

          {results.items.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <SearchX className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-display text-xl font-bold text-foreground">Nothing found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try different keywords or browse all stories.
              </p>
              <Link href="/posts" className="mt-4 text-sm font-medium text-forest-700 dark:text-forest-400 hover:underline">
                Explore all stories →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.items.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {results.pages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {page > 1 && (
                    <Link href={pageUrl(page - 1)}
                      className="rounded-full border border-stone-200 dark:border-stone-700 px-5 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                      ← Previous
                    </Link>
                  )}
                  <span className="flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-5 py-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                    {page} / {results.pages}
                  </span>
                  {page < results.pages && (
                    <Link href={pageUrl(page + 1)}
                      className="rounded-full border border-stone-200 dark:border-stone-700 px-5 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </>
      ) : q && q.length < 2 ? (
        <p className="text-sm text-muted-foreground">Enter at least 2 characters to search.</p>
      ) : (
        <p className="text-sm text-muted-foreground">Start typing to discover stories.</p>
      )}
    </div>
  )
}
