'use client'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile'

const schema = z.object({
  display_name: z.string().min(1, 'Required').max(100),
  bio: z.string().max(500, 'Max 500 characters').optional(),
})
type FormValues = z.infer<typeof schema>

export function ProfileForm() {
  const { user } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: user?.display_name ?? '', bio: user?.bio ?? '' },
  })

  function onSubmit(values: FormValues) {
    updateProfile.mutate(values, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500) },
    })
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadAvatar.mutate(file)
    e.target.value = ''
  }

  const initials = user?.display_name?.[0]?.toUpperCase() ?? '?'
  const avatarUrl = user?.avatar_url

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-accent flex items-center justify-center shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={user?.display_name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-accent-foreground">{initials}</span>
            )}
          </div>
          {uploadAvatar.isPending && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 rounded-full bg-foreground text-background p-1.5 hover:opacity-80 transition-opacity shadow"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-semibold">{user?.display_name}</p>
          <p className="text-sm text-muted-foreground">@{user?.username}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
      </div>

      {updateProfile.error && (
        <p className="text-sm text-red-600">
          {(updateProfile.error as any)?.response?.data?.detail ?? 'Failed to update profile.'}
        </p>
      )}

      <Input id="display_name" label="Display name" error={errors.display_name?.message} {...register('display_name')} />

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <label htmlFor="bio" className="text-sm font-medium text-stone-700 dark:text-stone-300">Bio</label>
        </div>
        <textarea
          id="bio"
          rows={3}
          placeholder="Tell readers a bit about yourself…"
          className={cn(
            'rounded-xl border px-4 py-2.5 text-sm shadow-sm resize-none transition-colors',
            'bg-white dark:bg-stone-900 placeholder:text-stone-400',
            'focus:outline-none focus:ring-2 focus:border-forest-500 focus:ring-forest-500/20',
            errors.bio ? 'border-red-400' : 'border-stone-300 dark:border-stone-700',
          )}
          {...register('bio')}
        />
        {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={updateProfile.isPending}>
          Save changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  )
}
