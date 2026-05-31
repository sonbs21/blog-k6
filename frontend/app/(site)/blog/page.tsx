import type { Metadata } from 'next'
import { api } from '@/lib/api'
import { PostCard } from '@/components/PostCard'
import { Tag } from '@/components/Tag'
import { MOCK_POSTS } from '@/lib/posts'
import type { PaginatedResponse, PostListItem } from '@/types'

export const metadata: Metadata = { title: 'Blog' }

interface Props {
  searchParams: { page?: string; tag?: string }
}

const ALL_TAGS = ['travel', 'code', 'tech', 'design', 'life', 'food']

async function getPosts(page: number, tag?: string): Promise<PaginatedResponse<PostListItem>> {
  try {
    const { data } = await api.get<PaginatedResponse<PostListItem>>('/posts', {
      params: { page, limit: 9, tag },
    })
    return data
  } catch {
    const filtered = tag
      ? MOCK_POSTS.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
      : MOCK_POSTS
    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      limit: 9,
      pages: 1,
    }
  }
}

export default async function BlogPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const tag = searchParams.tag
  const data = await getPosts(page, tag)

  return (
    <div className="site-container py-12 sm:py-16">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
        <p className="text-muted-foreground">
          {data.total} {data.total === 1 ? 'post' : 'posts'}
          {tag && <> tagged <span className="text-foreground font-medium">{tag}</span></>}
        </p>
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Tag
          name="All"
          href="/blog"
          className={!tag ? 'bg-foreground text-background hover:opacity-90' : ''}
        />
        {ALL_TAGS.map(t => (
          <Tag
            key={t}
            name={t}
            href={`/blog?tag=${t}`}
            className={tag === t ? 'ring-1 ring-current' : ''}
          />
        ))}
      </div>

      {/* Posts */}
      {data.items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-muted-foreground">No posts found.</p>
        </div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="mt-16 flex justify-center gap-2">
          {page > 1 && (
            <a href={`/blog?page=${page - 1}${tag ? `&tag=${tag}` : ''}`}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">
              ← Previous
            </a>
          )}
          <span className="rounded-md bg-muted px-4 py-2 text-sm">
            {page} / {data.pages}
          </span>
          {page < data.pages && (
            <a href={`/blog?page=${page + 1}${tag ? `&tag=${tag}` : ''}`}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
