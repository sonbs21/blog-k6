import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { PaginatedResponse, PostListItem } from '@/types'

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const result = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<PostListItem>>('/search', {
        params: { q: debouncedQuery },
      })
      return data
    },
    enabled: debouncedQuery.length >= 2,
  })

  return { query, setQuery, ...result }
}
