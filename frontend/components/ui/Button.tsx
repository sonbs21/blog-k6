import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-stone-900 text-white hover:bg-stone-700 focus:ring-stone-900 shadow-sm': variant === 'primary',
          'bg-forest-700 text-white hover:bg-forest-800 focus:ring-forest-500 shadow-sm': variant === 'secondary',
          'text-stone-700 hover:bg-stone-100 focus:ring-stone-300': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm': variant === 'danger',
          'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 focus:ring-stone-300': variant === 'outline',
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
