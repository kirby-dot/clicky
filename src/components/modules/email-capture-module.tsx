'use client'

import { useState } from 'react'
import { Mail, Check, AlertCircle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
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

  const [isOpen, setIsOpen] = useState(false)
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

  const handleClose = () => {
    setIsOpen(false)
    // Reset form after modal closes
    setTimeout(() => {
      if (status === 'success') {
        setStatus('idle')
        setEmail('')
      }
    }, 300)
  }

  const backgroundColor = content.style?.backgroundColor || 'var(--color-primary)'
  const textColor = content.style?.textColor || 'white'
  const buttonColor = content.style?.buttonColor || 'var(--color-secondary)'
  const borderRadius = content.style?.borderRadius !== undefined
    ? `${content.style.borderRadius}px`
    : 'var(--border-radius)'

  return (
    <>
      {/* Button to trigger modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full font-bold py-4 px-6 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
        style={{
          backgroundColor: buttonColor,
          color: textColor,
          borderRadius,
        }}
      >
        <Mail className="w-5 h-5" />
        {content.buttonText || 'Subscribe to Newsletter'}
      </button>

      {/* Modal with form */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        maxWidth="md"
      >
        {status === 'success' ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                {content.successMessage || 'Thanks for subscribing!'}
              </h3>
              <p className="text-gray-600">Check your email for confirmation</p>
              <button
                onClick={handleClose}
                className="mt-4 px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {content.title || 'Stay Updated'}
                </h3>
                {content.description && (
                  <p className="text-gray-600 mt-1">{content.description}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === 'error') setStatus('idle')
                  }}
                  placeholder={content.placeholder || 'Enter your email'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && errorMessage && (
                <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
                }}
              >
                {status === 'loading' ? 'Subscribing...' : (content.buttonText || 'Subscribe')}
              </button>
            </form>

            <p className="text-xs text-center mt-6 text-gray-500">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}
