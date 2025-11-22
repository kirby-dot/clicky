'use client'

import { ReactNode } from 'react'
import { Button } from './button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-6xl opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      <div className="flex gap-3">
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// Loading skeleton component
export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

// Stat card for dashboard
export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
}: {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
}) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-soft hover:shadow-soft-lg transition-all">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {change && (
        <p className={`text-sm font-semibold px-2 py-1 rounded-lg inline-block ${changeColors[changeType]}`}>
          {change}
        </p>
      )}
    </div>
  )
}
