'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export function AuthorGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthor } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
    else if (!isAuthor()) router.replace('/')
  }, [isAuthenticated, isAuthor, router])

  if (!isAuthenticated || !isAuthor()) return null
  return <>{children}</>
}
