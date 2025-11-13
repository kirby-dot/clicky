import { Mail } from 'lucide-react'
import type { Module } from '@/types'

interface EmailButtonModuleProps {
  module: Module
}

export function EmailButtonModule({ module }: EmailButtonModuleProps) {
  const content = module.content as {
    email: string
    subject?: string
    buttonText?: string
  }

  const mailto = `mailto:${content.email}${content.subject ? `?subject=${encodeURIComponent(content.subject)}` : ''}`

  return (
    <a
      href={mailto}
      className="block w-full px-6 py-4 bg-gradient-to-r from-pastel-mint to-pastel-sage text-gray-900 font-semibold rounded-2xl shadow-soft hover:shadow-soft-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-gray-200"
    >
      <Mail className="w-5 h-5" />
      <span>{content.buttonText || 'Get in Touch'}</span>
    </a>
  )
}
