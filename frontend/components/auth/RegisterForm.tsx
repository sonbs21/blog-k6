'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRegister } from '@/hooks/useAuth'

const schema = z.object({
  display_name: z.string().min(1, 'Required').max(100),
  username: z.string().min(3, 'Min 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscore only'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
type FormValues = z.infer<typeof schema>

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const registerMutation = useRegister()

  return (
    <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="flex flex-col gap-4">
      {registerMutation.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {(registerMutation.error as any)?.response?.data?.detail ?? 'Registration failed. Please try again.'}
        </div>
      )}

      <Input id="display_name" label="Full name" placeholder="Your name"
        error={errors.display_name?.message} {...register('display_name')} />
      <Input id="username" label="Username" placeholder="yourhandle"
        hint="Letters, numbers and underscores only"
        error={errors.username?.message} {...register('username')} />
      <Input id="email" label="Email address" type="email" placeholder="you@example.com"
        error={errors.email?.message} {...register('email')} />
      <Input id="password" label="Password" type="password" placeholder="Min 8 characters"
        error={errors.password?.message} {...register('password')} />
      <Input id="confirm_password" label="Confirm password" type="password" placeholder="Repeat password"
        error={errors.confirm_password?.message} {...register('confirm_password')} />

      <Button type="submit" isLoading={registerMutation.isPending} size="lg" className="w-full rounded-xl mt-1">
        Create account
      </Button>

      <p className="text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-forest-700 hover:underline">Sign in</Link>
      </p>
    </form>
  )
}
