import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Eye, Heart, Calendar, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate, readingTime } from '@/lib/utils'
import { processContent } from '@/lib/posts'
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
    return {}
  }
}

export default async function PostPage({ params }: Props) {
  let post: PostDetail
  try {
    const { data } = await api.get<PostDetail>(`/posts/${params.slug}`)
    post = data
  } catch {
    notFound()
  }

  const processedContent = await processContent(post.content)

  return (
    <article className="pb-20">
      {/* Back navigation */}
      <div className="mb-8">
        <Link href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          All Stories
        </Link>
      </div>

      {/* Cover image */}
      {post.cover_image && (
        <div className="relative mb-10 aspect-[21/9] overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 shadow-lg">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 72rem"
          />
        </div>
      )}

      {/* Article header */}
      <header className="mx-auto max-w-2xl mb-12">
        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/blog?tag=${tag}`} className="tag-pill-forest text-xs">
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold leading-tight text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl mb-6">
          {post.title}
        </h1>

        {/* Description */}
        {post.description && (
          <p className="text-lg leading-relaxed text-stone-500 dark:text-stone-400 mb-6">{post.description}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 border-t border-b border-stone-100 dark:border-stone-800 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700 text-sm font-bold text-stone-600 dark:text-stone-300 uppercase">
              {post.author.display_name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">{post.author.display_name}</p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
            {post.location && (
              <span className="flex items-center gap-1 font-medium text-stone-600 dark:text-stone-400">
                <MapPin className="h-3.5 w-3.5 text-forest-600" />
                {post.location}
              </span>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.published_at)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime(post.content)} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.view_count.toLocaleString()}
            </span>
            {post.favorite_count > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {post.favorite_count}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl">
        <div
          className="prose prose-stone prose-lg dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>

      {/* Footer */}
      <div className="mx-auto mt-16 max-w-2xl border-t border-stone-200 dark:border-stone-800 pt-8">
        <div className="flex items-center justify-between">
          <Link href="/blog"
            className="flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to all stories
          </Link>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${tag}`} className="tag-pill text-xs">
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
