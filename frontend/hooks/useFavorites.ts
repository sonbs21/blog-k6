import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { postKeys } from '@/hooks/usePosts'

export function useFavoriteToggle(slug: string, isFavorited: boolean) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      isFavorited
        ? api.delete(`/users/me/favorites/${slug}`)
        : api.post(`/users/me/favorites/${slug}`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(slug) })
      const prev = queryClient.getQueryData(postKeys.detail(slug))
      queryClient.setQueryData(postKeys.detail(slug), (old: any) =>
        old ? { ...old, is_favorited: !isFavorited, favorite_count: old.favorite_count + (isFavorited ? -1 : 1) } : old
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(postKeys.detail(slug), context.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: postKeys.detail(slug) }),
  })
}

export function useFollowToggle(username: string, isFollowing: boolean) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      isFollowing
        ? api.delete(`/users/me/following/${username}`)
        : api.post(`/users/me/following/${username}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['following'] }),
  })
}
