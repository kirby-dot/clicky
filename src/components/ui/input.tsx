import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-none border-3 border-black bg-white px-4 py-3 text-base font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:shadow-brutal focus-visible:translate-x-0.5 focus-visible:translate-y-0.5 transition-all disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
