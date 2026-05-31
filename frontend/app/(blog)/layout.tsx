import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
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
