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
          'inline-flex items-center justify-center whitespace-nowrap font-bold border-3 border-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-neo-yellow shadow-brutal hover:shadow-brutal-lg': variant === 'default',
            'border-4 border-black bg-white hover:bg-gray-50 shadow-brutal': variant === 'outline',
            'border-2 hover:bg-gray-100 shadow-brutal-sm': variant === 'ghost',
            'bg-neo-pink shadow-brutal hover:shadow-brutal-lg': variant === 'destructive',
          },
          {
            'h-11 px-6 py-2 text-base': size === 'default',
            'h-9 px-4 text-sm': size === 'sm',
            'h-13 px-8 text-lg': size === 'lg',
            'h-11 w-11': size === 'icon',
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
