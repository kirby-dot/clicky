'use client'

import { useState } from 'react'
import { MessageCircle, Check, AlertCircle, User, Mail as MailIcon, Send } from 'lucide-react'
import type { Module } from '@/types'

interface ContactFormModuleProps {
  module: Module
  profileId: string
}

export function ContactFormModule({ module, profileId }: ContactFormModuleProps) {
  const content = module.content as {
    title?: string
    description?: string
    namePlaceholder?: string
    emailPlaceholder?: string
    messagePlaceholder?: string
    buttonText?: string
    successMessage?: string
    requireName?: boolean
    requireEmail?: boolean
    style?: {
      backgroundColor?: string
      textColor?: string
      buttonColor?: string
      borderRadius?: number
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (content.requireName !== false && !formData.name.trim()) {
      setStatus('error')
      setErrorMessage('Please enter your name')
      return
    }

    if (content.requireEmail !== false && !formData.email.trim()) {
      setStatus('error')
      setErrorMessage('Please enter your email')
      return
    }

    if (content.requireEmail !== false && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    if (!formData.message.trim()) {
      setStatus('error')
      setErrorMessage('Please enter a message')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profile_id: profileId,
          module_id: module.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
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
            {content.successMessage || 'Message Sent!'}
          </h3>
          <p className="text-sm opacity-90">We'll get back to you soon</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all"
          >
            Send Another Message
          </button>
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">
              {content.title || 'Get in Touch'}
            </h3>
            {content.description && (
              <p className="text-sm opacity-90 mt-1">{content.description}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {content.requireName !== false && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 opacity-50" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (status === 'error') setStatus('idle')
                }}
                placeholder={content.namePlaceholder || 'Your name'}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:ring-4 focus:ring-white/30 focus:outline-none"
                style={{ borderRadius }}
                disabled={status === 'loading'}
              />
            </div>
          )}

          {content.requireEmail !== false && (
            <div className="relative">
              <MailIcon className="absolute left-3 top-3.5 w-5 h-5 opacity-50" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (status === 'error') setStatus('idle')
                }}
                placeholder={content.emailPlaceholder || 'Your email'}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:ring-4 focus:ring-white/30 focus:outline-none"
                style={{ borderRadius }}
                disabled={status === 'loading'}
              />
            </div>
          )}

          <div className="relative">
            <textarea
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value })
                if (status === 'error') setStatus('idle')
              }}
              placeholder={content.messagePlaceholder || 'Your message'}
              rows={4}
              className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-4 focus:ring-white/30 focus:outline-none resize-none"
              style={{ borderRadius }}
              disabled={status === 'loading'}
            />
          </div>

          {status === 'error' && errorMessage && (
            <div className="flex items-center gap-2 text-sm bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full font-bold py-3 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            style={{
              backgroundColor: buttonColor,
              color: 'white',
              borderRadius,
            }}
          >
            {status === 'loading' ? (
              'Sending...'
            ) : (
              <>
                <Send className="w-5 h-5" />
                {content.buttonText || 'Send Message'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
