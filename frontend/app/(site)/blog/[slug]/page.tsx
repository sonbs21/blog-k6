import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Eye, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate, readingTime } from '@/lib/utils'
import { processContent, extractHeadings, MOCK_POST_DETAIL } from '@/lib/posts'
import { Tag } from '@/components/Tag'
import { TableOfContents } from '@/components/TableOfContents'
import type { PostDetail } from '@/types'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data } = await api.get<PostDetail>(`/posts/${params.slug}`)
    return {
      title: data.title,
      description: data.description,
      openGraph: {
        title: data.title,
        description: data.description,
        images: data.cover_image ? [data.cover_image] : [],
      },
    }
  } catch {
    return { title: 'Post not found' }
  }
}

async function getPost(slug: string): Promise<PostDetail> {
  try {
    const { data } = await api.get<PostDetail>(`/posts/${slug}`)
    return data
  } catch {
    // Fall back to mock if available
    if (slug === MOCK_POST_DETAIL.slug) return MOCK_POST_DETAIL
    notFound()
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug)
  const processedContent = await processContent(post.content)
  const headings = extractHeadings(processedContent)
  const mins = readingTime(post.content)

  return (
    <div className="site-container py-10 sm:py-14">

      {/* Back */}
      <Link href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-16">
        {/* ── Main content ── */}
        <article>
          {/* Cover image */}
          {post.cover_image && (
            <div className="relative mb-8 aspect-[2/1] overflow-hidden rounded-xl bg-muted">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map(t => (
              <Tag key={t} name={t} href={`/blog?tag=${t}`} />
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-snug mb-5 text-balance">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-10 pb-8 border-b border-border">
            <span className="font-medium text-foreground">{post.author.display_name}</span>
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.published_at)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {mins} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {post.view_count.toLocaleString()} views
            </span>
          </div>

          {/* Table of contents — mobile (inline) */}
          {headings.length >= 2 && (
            <details className="lg:hidden mb-8 rounded-lg border border-border bg-muted/50 p-4">
              <summary className="text-sm font-semibold cursor-pointer select-none">
                Table of contents
              </summary>
              <div className="mt-3">
                <TableOfContents headings={headings} />
              </div>
            </details>
          )}

          {/* Prose content */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {/* Footer */}
          <div className="mt-14 pt-8 border-t border-border">
            <Link href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to all posts
            </Link>
          </div>
        </article>

        {/* ── Sticky ToC — desktop ── */}
        {headings.length >= 2 && (
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
