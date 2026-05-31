'use client'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useAuthorPost } from '@/hooks/useAuthorPost'
import { PostEditorPage } from '@/components/author/PostEditorPage'

interface Props { params: { slug: string } }

export default function EditPostPage({ params }: Props) {
  const { data: post, isLoading, isError } = useAuthorPost(params.slug)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-8 flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !post) return notFound()

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">{post.title}</p>
        </div>
        {post.status === 'PUBLISHED' && (
          <Link
            href={`/posts/${post.slug}`}
            target="_blank"
            className="text-sm text-accent hover:underline"
          >
            View live →
          </Link>
        )}
      </div>

      <PostEditorPage
        slug={params.slug}
        updatedAt={post.updated_at}
        defaultValues={{
          title: post.title,
          description: post.description,
          location: post.location,
          content: post.content,
          cover_image: post.cover_image ?? undefined,
          status: post.status,
          tags: post.tags,
        }}
      />
    </div>
  )
}
