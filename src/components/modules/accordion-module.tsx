'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Module } from '@/types'

interface AccordionModuleProps {
  module: Module
}

export function AccordionModule({ module }: AccordionModuleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const content = module.content as {
    question: string
    answer: string
  }

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900">{content.question || module.title}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gradient-to-br from-pastel-sky/10 to-pastel-lavender/10 border-t border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">{content.answer}</p>
        </div>
      )}
    </div>
  )
}
