'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLogin } from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

export function LoginForm({ registeredSuccess }: { registeredSuccess?: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const login = useLogin()

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="flex flex-col gap-5">
      {registeredSuccess && (
        <div className="rounded-xl bg-forest-50 border border-forest-200 p-4 text-sm text-forest-800">
          ✓ Account created successfully. Please sign in.
        </div>
      )}
      {login.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {(login.error as any)?.response?.data?.detail ?? 'Incorrect email or password.'}
        </div>
      )}

      <Input id="email" label="Email address" type="email" placeholder="you@example.com"
        error={errors.email?.message} {...register('email')} />
      <Input id="password" label="Password" type="password" placeholder="••••••••"
        error={errors.password?.message} {...register('password')} />

      <Button type="submit" isLoading={login.isPending} size="lg" className="w-full rounded-xl mt-1">
        Sign In
      </Button>

      <p className="text-center text-sm text-stone-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-forest-700 hover:underline">
          Create one free
        </Link>
      </p>
    </form>
  )
}
