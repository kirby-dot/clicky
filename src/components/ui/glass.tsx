import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: ReactNode
  className?: string
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'bg-white/50 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20',
        className
      )}
    >
      {children}
    </div>
  )
}

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white/50 backdrop-blur-xl rounded-xl shadow-sm border border-white/20',
        hover && 'transition-all hover:bg-white/60 hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  )
}

interface GlassButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled = false,
}: GlassButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-accent-400 text-white hover:bg-accent-500 shadow-sm hover:shadow-md',
    secondary: 'bg-white/50 backdrop-blur-xl text-slate-800 hover:bg-white/70 shadow-sm border border-white/20',
    ghost: 'bg-transparent hover:bg-white/30 text-slate-700',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </button>
  )
}

interface GlassInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
  icon?: ReactNode
}

export function GlassInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  icon,
}: GlassInputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full bg-white/50 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2.5',
          'text-slate-800 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-accent-400/50 focus:border-accent-400',
          'transition-all',
          icon && 'pl-10',
          className
        )}
      />
    </div>
  )
}

interface GlassBadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
  className?: string
}

export function GlassBadge({ children, variant = 'default', className }: GlassBadgeProps) {
  const variantStyles = {
    success: 'bg-green-100/80 text-green-700 border-green-200',
    warning: 'bg-yellow-100/80 text-yellow-700 border-yellow-200',
    error: 'bg-red-100/80 text-red-700 border-red-200',
    info: 'bg-blue-100/80 text-blue-700 border-blue-200',
    default: 'bg-slate-100/80 text-slate-700 border-slate-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border backdrop-blur-sm',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
