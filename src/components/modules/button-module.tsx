import type { Module } from '@/types'

interface ButtonModuleProps {
  module: Module
}

export function ButtonModule({ module }: ButtonModuleProps) {
  const content = module.content as {
    url: string
    text: string
    style?: {
      backgroundColor?: string
      textColor?: string
      borderColor?: string
      borderWidth?: number
      borderRadius?: number
      shadow?: 'none' | 'sm' | 'md' | 'lg'
      fontSize?: number
      fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
      fullWidth?: boolean
    } | 'primary' | 'secondary' | 'outline'
    icon?: string
  }

  // Handle legacy string-based styles and new object-based styles
  const isLegacyStyle = typeof content.style === 'string' || !content.style

  if (isLegacyStyle) {
    const styleClasses = {
      primary: 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-soft-lg hover:shadow-soft-xl',
      secondary: 'bg-gradient-to-r from-pastel-rose to-pastel-peach text-gray-900 shadow-soft hover:shadow-soft-lg',
      outline: 'border-2 border-gray-900 bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white shadow-soft'
    }

    const selectedStyle = (content.style as 'primary' | 'secondary' | 'outline') || 'primary'

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

  // New customizable style
  const styleConfig = content.style as {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    shadow?: 'none' | 'sm' | 'md' | 'lg'
    fontSize?: number
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
    fullWidth?: boolean
  }

  // Font weight mapping
  const fontWeightClass = styleConfig.fontWeight
    ? styleConfig.fontWeight === 'normal' ? 'font-normal' :
      styleConfig.fontWeight === 'medium' ? 'font-medium' :
      styleConfig.fontWeight === 'semibold' ? 'font-semibold' :
      'font-bold'
    : 'font-bold'

  // Shadow mapping
  const shadowClass = styleConfig.shadow
    ? styleConfig.shadow === 'none' ? '' :
      styleConfig.shadow === 'sm' ? 'shadow-sm hover:shadow-md' :
      styleConfig.shadow === 'md' ? 'shadow-md hover:shadow-lg' :
      'shadow-lg hover:shadow-xl'
    : 'shadow-md hover:shadow-lg'

  const widthClass = styleConfig.fullWidth !== false ? 'w-full' : 'w-auto inline-block'

  const className = `block ${widthClass} px-8 py-4 text-center ${fontWeightClass} ${shadowClass} transition-all hover:scale-105 active:scale-95`

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styleConfig.backgroundColor || '#6366f1',
    color: styleConfig.textColor || '#ffffff',
    borderRadius: `${styleConfig.borderRadius ?? 16}px`,
    ...(styleConfig.borderColor && styleConfig.borderWidth && {
      border: `${styleConfig.borderWidth}px solid ${styleConfig.borderColor}`,
    }),
    ...(styleConfig.fontSize && { fontSize: `${styleConfig.fontSize}px` }),
  }

  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={inlineStyles}
    >
      <span>{content.text || module.title}</span>
    </a>
  )
}
