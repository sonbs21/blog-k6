import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { PostListItem } from '@/types'

interface PostCardProps {
  post: PostListItem
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-stone-900 shadow-xl">
        <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] sm:aspect-[21/9]">
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-forest-900 via-stone-800 to-stone-900" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="mb-3 flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag}
                  className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="font-display text-2xl font-bold leading-snug text-white sm:text-3xl line-clamp-2 mb-3">
              {post.title}
            </h2>
            <p className="line-clamp-2 text-sm text-stone-300 mb-4 max-w-2xl">{post.description}</p>
            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span className="font-medium text-stone-300">{post.author.display_name}</span>
              {post.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {post.location}
                </span>
              )}
              {post.published_at && <span>{formatDate(post.published_at)}</span>}
            </div>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[3/2] overflow-hidden bg-stone-100">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
            <Compass className="h-10 w-10 text-stone-300" />
          </div>
        )}

        {/* Location badge */}
        {post.location && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-white" />
            <span className="text-xs font-medium text-white">{post.location}</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map((tag) => (
            <Link key={tag} href={`/blog?tag=${tag}`} className="tag-pill-forest">
              {tag}
            </Link>
          ))}
        </div>

        <Link href={`/blog/${post.slug}`} className="flex-1">
          <h2 className="font-display text-lg font-bold leading-snug text-stone-900 group-hover:text-forest-700 transition-colors line-clamp-2 mb-2">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm leading-relaxed text-stone-500">{post.description}</p>
        </Link>

        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-stone-600 uppercase">
              {post.author.display_name[0]}
            </div>
            <span className="text-xs font-medium text-stone-600">{post.author.display_name}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-stone-400">
            {post.view_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.view_count}
              </span>
            )}
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
          </div>
        </div>
      </div>
    </article>
  )
}

function Compass({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  )
}
