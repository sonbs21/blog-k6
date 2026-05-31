import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { AuthorPostDetail, AuthorPostListItem, PaginatedResponse } from '@/types'

export const authorPostKeys = {
  all: ['author-posts'] as const,
  list: () => ['author-posts', 'list'] as const,
  detail: (slug: string) => ['author-posts', 'detail', slug] as const,
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function useAuthorPosts() {
  return useQuery({
    queryKey: authorPostKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AuthorPostListItem>>('/author/posts')
      return data
    },
  })
}

export function useAuthorPost(slug: string) {
  return useQuery({
    queryKey: authorPostKeys.detail(slug),
    queryFn: async () => {
      const { data } = await api.get<AuthorPostDetail>(`/author/posts/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

interface PostPayload {
  title: string
  description: string
  content: string
  location: string
  cover_image?: string
  tags: string[]
  status: 'DRAFT' | 'PUBLISHED'
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (data: PostPayload) =>
      api.post<{ slug: string }>('/author/posts', data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: authorPostKeys.list() })
      if (variables.status === 'PUBLISHED') {
        router.push(`/blog/${res.data.slug}`)
      } else {
        router.push('/author/posts')
      }
    },
  })
}

export function useUpdatePost(slug: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (data: PostPayload) =>
      api.put<{ slug: string }>(`/author/posts/${slug}`, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: authorPostKeys.list() })
      queryClient.invalidateQueries({ queryKey: authorPostKeys.detail(slug) })
      queryClient.invalidateQueries({ queryKey: ['posts', 'detail', slug] })
      if (variables.status === 'PUBLISHED') {
        router.push(`/blog/${res.data.slug}`)
      } else {
        router.push('/author/posts')
      }
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => api.delete(`/author/posts/${slug}`),
    onMutate: async (slug) => {
      await queryClient.cancelQueries({ queryKey: authorPostKeys.list() })
      const previous = queryClient.getQueryData(authorPostKeys.list())
      queryClient.setQueryData(authorPostKeys.list(), (old: PaginatedResponse<AuthorPostListItem> | undefined) => {
        if (!old) return old
        return { ...old, items: old.items.filter((p) => p.slug !== slug), total: old.total - 1 }
      })
      return { previous }
    },
    onError: (_err, _slug, context) => {
      if (context?.previous) {
        queryClient.setQueryData(authorPostKeys.list(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: authorPostKeys.list() })
    },
  })
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post<{ url: string }>('/uploads/image', form)
      return data.url
    },
  })
}
