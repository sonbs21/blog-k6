import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { PostCard } from '@/components/PostCard'
import { MOCK_POSTS } from '@/lib/posts'
import type { PaginatedResponse, PostListItem } from '@/types'

export const metadata: Metadata = {
  title: 'Travel Stories — Home',
}

async function getRecentPosts(): Promise<PostListItem[]> {
  try {
    const { data } = await api.get<PaginatedResponse<PostListItem>>('/posts', {
      params: { page: 1, limit: 5 },
    })
    return data.items
  } catch {
    return MOCK_POSTS.slice(0, 5)
  }
}

export default async function HomePage() {
  const posts = await getRecentPosts()
  const [featured, ...recent] = posts

  return (
    <div className="site-container py-16 sm:py-24">

      {/* ── Hero ── */}
      <section className="mb-20">
        <p className="text-sm font-medium text-accent mb-4">Hello, world</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] mb-6 max-w-2xl text-balance">
          Stories from the road —<br className="hidden sm:block" />
          travel, code, and everything in between.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-8">
          I&apos;m Son Bui. I travel the world, build things on the internet,
          and write about both. This is where those stories live.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Read the blog
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            About me
          </Link>
        </div>
      </section>

      {/* ── Featured post ── */}
      {featured && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Featured
            </h2>
            <Link href="/blog"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              All posts <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <PostCard post={featured} variant="featured" />
        </section>
      )}

      {/* ── Recent posts ── */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Recent
          </h2>
          <div className="divide-y divide-border">
            {recent.map(post => (
              <PostCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
