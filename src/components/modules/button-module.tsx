import type { Module } from '@/types'

interface ButtonModuleProps {
  module: Module
}

export function ButtonModule({ module }: ButtonModuleProps) {
  const content = module.content as {
    url: string
    text: string
    style?: 'primary' | 'secondary' | 'outline'
    icon?: string
  }

  const styleClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-soft-lg hover:shadow-soft-xl',
    secondary: 'bg-gradient-to-r from-pastel-rose to-pastel-peach text-gray-900 shadow-soft hover:shadow-soft-lg',
    outline: 'border-2 border-gray-900 bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white shadow-soft'
  }

  const selectedStyle = content.style || 'primary'

  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block w-full px-8 py-4 text-center font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 ${styleClasses[selectedStyle]}`}
    >
      <span className="text-lg">{content.text || module.title}</span>
    </a>
  )
}
