import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { UserProfile } from '@/types'

export function useUpdateProfile() {
  const { user, setAuth } = useAuthStore()
  return useMutation({
    mutationFn: (data: { display_name?: string; bio?: string }) =>
      api.put<UserProfile>('/users/me', data),
    onSuccess: (res) => {
      const tokens = {
        access_token: localStorage.getItem('access_token') ?? '',
        refresh_token: localStorage.getItem('refresh_token') ?? '',
      }
      setAuth(res.data, tokens.access_token, tokens.refresh_token)
    },
  })
}

export function useUploadAvatar() {
  const { setAuth } = useAuthStore()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post<{ avatar_url: string }>('/users/me/avatar', form)
      return data.avatar_url
    },
    onSuccess: (avatarUrl) => {
      const currentUser = useAuthStore.getState().user
      if (!currentUser) return
      const tokens = {
        access_token: localStorage.getItem('access_token') ?? '',
        refresh_token: localStorage.getItem('refresh_token') ?? '',
      }
      setAuth({ ...currentUser, avatar_url: avatarUrl }, tokens.access_token, tokens.refresh_token)
    },
  })
}

export function useChangePassword() {
  const { clearAuth } = useAuthStore()
  const router = useRouter()
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api.put('/users/me/password', data),
    onSuccess: () => {
      clearAuth()
      router.push('/login?session=expired')
    },
  })
}
