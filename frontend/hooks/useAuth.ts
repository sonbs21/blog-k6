import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { TokenResponse, UserProfile } from '@/types'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const { data: tokens } = await api.post<TokenResponse>('/auth/login', data)
      const { data: user } = await api.get<UserProfile>('/users/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      return { tokens, user }
    },
    onSuccess: ({ tokens, user }) => {
      setAuth(user, tokens.access_token, tokens.refresh_token)
      router.push('/')
    },
  })
}

export function useRegister() {
  const router = useRouter()
  return useMutation({
    mutationFn: (data: { username: string; email: string; password: string; display_name: string }) =>
      api.post('/auth/register', data),
    onSuccess: () => router.push('/login?registered=1'),
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const router = useRouter()
  return useMutation({
    mutationFn: () => api.post('/auth/logout', {
      refresh_token: localStorage.getItem('refresh_token'),
    }),
    onSettled: () => {
      clearAuth()
      router.push('/')
    },
  })
}
