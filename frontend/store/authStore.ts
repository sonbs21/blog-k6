'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/types'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  isAuthor: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        sessionStorage.setItem('access_token', accessToken)
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        set({ user, isAuthenticated: true })
      },

      clearAuth: () => {
        sessionStorage.removeItem('access_token')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
      },

      isAuthor: () => get().user?.role === 'AUTHOR',
    }),
    {
      name: 'auth-user',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) {
          const token = localStorage.getItem('access_token')
          if (token) sessionStorage.setItem('access_token', token)
        }
      },
    },
  ),
)
