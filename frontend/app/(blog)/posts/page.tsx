import type { Metadata } from 'next'
import Link from 'next/link'
import { Filter } from 'lucide-react'
import { api } from '@/lib/api'
import { PostCard } from '@/components/blog/PostCard'
import { MOCK_POSTS } from '@/lib/posts'
import type { PaginatedResponse, PostListItem } from '@/types'

export const metadata: Metadata = { title: 'Explore Stories' }

interface Props {
  searchParams: { page?: string; tag?: string; location?: string }
}

async function getPosts(
  page: number,
  tag?: string,
  location?: string,
): Promise<PaginatedResponse<PostListItem>> {
  try {
    const { data } = await api.get<PaginatedResponse<PostListItem>>('/posts', {
      params: { page, limit: 12, tag, location },
    })
    return data
  } catch {
    const filtered = MOCK_POSTS.filter((p) => {
      if (tag && !p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return false
      if (location && !p.location?.toLowerCase().includes(location.toLowerCase())) return false
      return true
    })
    return { items: filtered, total: filtered.length, page: 1, limit: 12, pages: 1 }
  }
}

export default async function PostsPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const data = await getPosts(page, searchParams.tag, searchParams.location)

  const activeFilter = searchParams.tag || searchParams.location

  return (
    <div className="pb-16">
      {/* Page header */}
      <div className="mb-10 border-b border-stone-200 pb-8">
        <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">
          {activeFilter ? (
            <>Stories tagged <span className="text-forest-700 italic">{activeFilter}</span></>
          ) : (
            'All Stories'
          )}
        </h1>
        {data.total > 0 && (
          <p className="text-stone-500 text-sm">{data.total} {data.total === 1 ? 'story' : 'stories'} found</p>
        )}

        {activeFilter && (
          <Link href="/blog"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200 transition-colors">
            <Filter className="h-3 w-3" />
            Clear filter
          </Link>
        )}
      </div>

      {data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-display text-2xl font-bold text-stone-400">No stories found</p>
          <p className="mt-2 text-sm text-stone-400">Try a different filter or check back later.</p>
          <Link href="/blog" className="mt-4 text-sm font-medium text-forest-700 hover:underline">
            View all stories
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}${searchParams.tag ? `&tag=${searchParams.tag}` : ''}${searchParams.location ? `&location=${searchParams.location}` : ''}`}
              className="rounded-full border border-stone-200 px-5 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
              ← Previous
            </Link>
          )}
          <span className="flex items-center rounded-full bg-stone-100 px-5 py-2 text-sm font-medium text-stone-700">
            Page {page} of {data.pages}
          </span>
          {page < data.pages && (
            <Link
              href={`/blog?page=${page + 1}${searchParams.tag ? `&tag=${searchParams.tag}` : ''}${searchParams.location ? `&location=${searchParams.location}` : ''}`}
              className="rounded-full border border-stone-200 px-5 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
