import type { Metadata } from 'next'
import { PostEditorPage } from '@/components/author/PostEditorPage'

export const metadata: Metadata = { title: 'New Post' }

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">New Post</h1>
        <p className="text-sm text-muted-foreground mt-1">Write and publish a new story</p>
      </div>
      <PostEditorPage />
    </div>
  )
}
