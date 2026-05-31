import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PaginatedResponse, PostDetail, PostListItem } from '@/types'

export const postKeys = {
  all: ['posts'] as const,
  list: (params: object) => ['posts', 'list', params] as const,
  detail: (slug: string) => ['posts', 'detail', slug] as const,
}

export function usePostList(params: { page?: number; limit?: number; tag?: string; location?: string } = {}) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<PostListItem>>('/posts', { params })
      return data
    },
  })
}

export function usePostDetail(slug: string) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: async () => {
      const { data } = await api.get<PostDetail>(`/posts/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}
