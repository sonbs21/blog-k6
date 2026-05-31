'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useAuthStore } from '@/store/authStore'

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthor } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (!isAuthor()) {
      router.replace('/')
    }
  }, [isAuthenticated, isAuthor, router])

  if (!isAuthenticated || !isAuthor()) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="site-container py-8">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
