import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary-500 text-white shadow-soft hover:shadow-soft-lg hover:bg-primary-600': variant === 'default',
            'border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700': variant === 'outline',
            'hover:bg-gray-100 text-gray-700': variant === 'ghost',
            'bg-red-500 text-white shadow-soft hover:shadow-soft-lg hover:bg-red-600': variant === 'destructive',
          },
          {
            'h-11 px-6 py-2 text-base': size === 'default',
            'h-9 px-4 text-sm': size === 'sm',
            'h-12 px-8 text-lg': size === 'lg',
            'h-10 w-10 rounded-lg': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
