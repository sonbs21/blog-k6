'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useChangePassword } from '@/hooks/useProfile'

const schema = z.object({
  current_password: z.string().min(1, 'Required'),
  new_password: z.string().min(8, 'At least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
type FormValues = z.infer<typeof schema>

export function ChangePasswordForm() {
  const changePassword = useChangePassword()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function onSubmit({ current_password, new_password }: FormValues) {
    changePassword.mutate({ current_password, new_password }, { onSuccess: () => reset() })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {changePassword.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {(changePassword.error as any)?.response?.data?.detail ?? 'Failed to change password.'}
        </div>
      )}

      <Input
        id="current_password"
        label="Current password"
        type="password"
        placeholder="••••••••"
        error={errors.current_password?.message}
        {...register('current_password')}
      />
      <Input
        id="new_password"
        label="New password"
        type="password"
        placeholder="Min 8 characters"
        error={errors.new_password?.message}
        {...register('new_password')}
      />
      <Input
        id="confirm_password"
        label="Confirm new password"
        type="password"
        placeholder="Repeat new password"
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />

      <p className="text-xs text-muted-foreground">
        You will be signed out on all devices after changing your password.
      </p>

      <Button type="submit" variant="danger" isLoading={changePassword.isPending}>
        Change password
      </Button>
    </form>
  )
}
