'use client'

import { useState } from 'react'
import { Mail, Check, AlertCircle } from 'lucide-react'
import type { Module } from '@/types'

interface EmailCaptureModuleProps {
  module: Module
  profileId: string
}

export function EmailCaptureModule({ module, profileId }: EmailCaptureModuleProps) {
  const content = module.content as {
    title?: string
    description?: string
    placeholder?: string
    buttonText?: string
    successMessage?: string
    style?: {
      backgroundColor?: string
      textColor?: string
      buttonColor?: string
      borderRadius?: number
    }
  }

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          profile_id: profileId,
          module_id: module.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to subscribe')
      }

      setStatus('success')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  const backgroundColor = content.style?.backgroundColor || 'var(--color-primary)'
  const textColor = content.style?.textColor || 'white'
  const buttonColor = content.style?.buttonColor || 'var(--color-secondary)'
  const borderRadius = content.style?.borderRadius !== undefined
    ? `${content.style.borderRadius}px`
    : 'var(--border-radius)'

  if (status === 'success') {
    return (
      <div
        className="p-8 shadow-lg text-center"
        style={{
          backgroundColor,
          color: textColor,
          borderRadius,
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold">
            {content.successMessage || 'Thanks for subscribing!'}
          </h3>
          <p className="text-sm opacity-90">Check your email for confirmation</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="p-8 shadow-lg"
      style={{
        backgroundColor,
        color: textColor,
        borderRadius,
      }}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">
              {content.title || 'Stay Updated'}
            </h3>
            {content.description && (
              <p className="text-sm opacity-90 mt-1">{content.description}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder={content.placeholder || 'Enter your email'}
            className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-4 focus:ring-white/30 focus:outline-none"
            style={{
              borderRadius,
            }}
            disabled={status === 'loading'}
          />

          {status === 'error' && errorMessage && (
            <div className="flex items-center gap-2 text-sm bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full font-bold py-3 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{
              backgroundColor: buttonColor,
              color: 'white',
              borderRadius,
            }}
          >
            {status === 'loading' ? 'Subscribing...' : (content.buttonText || 'Subscribe')}
          </button>
        </form>

        <p className="text-xs text-center mt-4 opacity-70">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  )
}
