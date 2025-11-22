'use client'

import { useState } from 'react'
import { MessageCircle, Check, AlertCircle, User, Mail as MailIcon, Send } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
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

  const [isOpen, setIsOpen] = useState(false)
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

  const handleClose = () => {
    setIsOpen(false)
    // Reset form after modal closes
    setTimeout(() => {
      if (status === 'success') {
        setStatus('idle')
        setFormData({ name: '', email: '', message: '' })
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
        <MessageCircle className="w-5 h-5" />
        {content.buttonText || 'Contact Us'}
      </button>

      {/* Modal with form */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        maxWidth="lg"
      >
        {status === 'success' ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                {content.successMessage || 'Message Sent!'}
              </h3>
              <p className="text-gray-600">We&apos;ll get back to you soon</p>
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
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {content.title || 'Get in Touch'}
                </h3>
                {content.description && (
                  <p className="text-gray-600 mt-1">{content.description}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {content.requireName !== false && (
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder={content.namePlaceholder || 'Your name'}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all"
                    disabled={status === 'loading'}
                  />
                </div>
              )}

              {content.requireEmail !== false && (
                <div className="relative">
                  <MailIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder={content.emailPlaceholder || 'Your email'}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all"
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
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none resize-none transition-all"
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
                className="w-full font-bold py-3 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                style={{
                  backgroundColor: buttonColor,
                  color: 'white',
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
        )}
      </Modal>
    </>
  )
}
