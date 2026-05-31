import type { Metadata } from 'next'
import { ProfileForm } from '@/components/member/ProfileForm'
import { ChangePasswordForm } from '@/components/member/ChangePasswordForm'

export const metadata: Metadata = { title: 'Profile' }

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Profile</h1>

      {/* Profile info */}
      <section className="rounded-xl border border-border bg-card p-6 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Personal info
        </h2>
        <ProfileForm />
      </section>

      {/* Change password */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Change password
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
