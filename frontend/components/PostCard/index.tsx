import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowUpRight } from 'lucide-react'
import { formatDate, estimateReadingTime } from '@/lib/utils'
import { Tag } from '@/components/Tag'
import type { PostListItem } from '@/types'

interface PostCardProps {
  post: PostListItem
  variant?: 'default' | 'compact' | 'featured'
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const readMins = estimateReadingTime(post.description)
  const href = `/blog/${post.slug}`

  /* ── Compact: single row list item ── */
  if (variant === 'compact') {
    return (
      <Link href={href}
        className="group flex items-center justify-between gap-4 py-4 border-t border-border first:border-t-0">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">
            {post.published_at ? formatDate(post.published_at) : '—'}
            {post.tags[0] && <> · <span>{post.tags[0]}</span></>}
          </p>
          <h3 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1 text-sm">
            {post.title}
          </h3>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent transition-colors" />
      </Link>
    )
  }

  /* ── Featured: large card with optional hero image ── */
  if (variant === 'featured') {
    return (
      <article className="group">
        {post.cover_image && (
          <Link href={href}
            className="relative mb-5 block aspect-[2/1] overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </Link>
        )}
        <div className="flex items-center gap-2 mb-3">
          {post.tags.slice(0, 2).map(t => (
            <Tag key={t} name={t} href={`/blog?tag=${t}`} />
          ))}
        </div>
        <Link href={href}>
          <h2 className="text-2xl font-bold tracking-tight leading-snug mb-2 group-hover:text-accent transition-colors text-balance">
            {post.title}
          </h2>
        </Link>
        <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">{post.description}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">{post.author.display_name}</span>
          {post.published_at && <><span>·</span><span>{formatDate(post.published_at)}</span></>}
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readMins} min</span>
        </div>
      </article>
    )
  }

  /* ── Default: grid card ── */
  return (
    <article className="group flex flex-col">
      {post.cover_image && (
        <Link href={href}
          className="relative mb-3 block aspect-[16/9] overflow-hidden rounded-lg bg-muted">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      )}
      <div className="flex items-center gap-1.5 mb-2">
        {post.tags.slice(0, 2).map(t => (
          <Tag key={t} name={t} href={`/blog?tag=${t}`} />
        ))}
      </div>
      <Link href={href} className="flex-1">
        <h2 className="font-semibold leading-snug mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {post.description}
        </p>
      </Link>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        {post.published_at && <span>{formatDate(post.published_at)}</span>}
        <span>·</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readMins} min</span>
      </div>
    </article>
  )
}
