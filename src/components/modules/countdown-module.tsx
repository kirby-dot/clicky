'use client'

import { useState, useEffect } from 'react'
import type { Module } from '@/types'

interface CountdownModuleProps {
  module: Module
}

export function CountdownModule({ module }: CountdownModuleProps) {
  const content = module.content as {
    targetDate: string
    title?: string
  }

  const calculateTimeLeft = () => {
    const difference = +new Date(content.targetDate) - +new Date()

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearTimeout(timer)
  })

  return (
    <div className="bg-gradient-to-br from-pastel-lavender to-pastel-lilac rounded-2xl p-8 shadow-soft-lg border border-gray-200">
      {content.title && (
        <h3 className="text-xl font-bold text-gray-900 text-center mb-6">{content.title}</h3>
      )}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds }
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="bg-white rounded-xl p-4 shadow-soft mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {String(item.value).padStart(2, '0')}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-700">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
