'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, Heart, Pencil, Trash2, PenLine, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useAuthorPosts, useDeletePost } from '@/hooks/useAuthorPost'
import type { AuthorPostListItem } from '@/types'

type Filter = 'ALL' | 'PUBLISHED' | 'DRAFT'

export default function MyPostsPage() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [deleteTarget, setDeleteTarget] = useState<AuthorPostListItem | null>(null)

  const { data, isLoading } = useAuthorPosts()
  const deletePost = useDeletePost()

  const posts = (data?.items ?? []).filter(
    (p) => filter === 'ALL' || p.status === filter,
  )

  function confirmDelete() {
    if (!deleteTarget) return
    deletePost.mutate(deleteTarget.slug, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const tabs: { label: string; value: Filter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Drafts', value: 'DRAFT' },
  ]

  return (
    <div className="mx-auto max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.total ?? 0} {data?.total === 1 ? 'post' : 'posts'} total
          </p>
        </div>
        <Link
          href="/author/posts/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <PenLine className="h-4 w-4" />
          New post
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const count =
            tab.value === 'ALL'
              ? data?.total
              : data?.items.filter((p) => p.status === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                filter === tab.value
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {count !== undefined && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">No posts yet.</p>
          <Link
            href="/author/posts/new"
            className="mt-3 text-sm font-medium text-accent hover:underline"
          >
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {posts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              onDelete={() => setDeleteTarget(post)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete post?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Delete <span className="font-medium text-foreground">"{deleteTarget.title}"</span>?
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletePost.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deletePost.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PostRow({ post, onDelete }: { post: AuthorPostListItem; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 px-4 py-4 bg-background hover:bg-muted/30 transition-colors">
      {/* Status badge */}
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
          post.status === 'PUBLISHED'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
        )}
      >
        {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
      </span>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-sm">{post.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {post.published_at ? formatDate(post.published_at) : `Updated ${formatDate(post.updated_at)}`}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {post.view_count.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" />
          {post.favorite_count}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/author/posts/${post.slug}/edit`}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          onClick={onDelete}
          className="p-2 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
