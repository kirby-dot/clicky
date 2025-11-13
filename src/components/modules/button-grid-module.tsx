'use client'

import type { Module } from '@/types'

interface ButtonGridModuleProps {
  module: Module
}

export function ButtonGridModule({ module }: ButtonGridModuleProps) {
  const content = module.content as {
    buttons: Array<{ title: string; url: string; icon?: string }>
    columns?: 2 | 3 | 4
  }

  const columns = content.columns || 2

  return (
    <div className={`grid gap-3 ${
      columns === 2 ? 'grid-cols-2' :
      columns === 3 ? 'grid-cols-3' :
      'grid-cols-2 md:grid-cols-4'
    }`}>
      {content.buttons.map((button, index) => (
        <a
          key={index}
          href={button.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-6 py-4 text-center font-semibold rounded-2xl shadow-soft hover:shadow-soft-lg transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-primary-500 to-purple-500 text-white"
        >
          {button.title || 'Button'}
        </a>
      ))}
    </div>
  )
}
