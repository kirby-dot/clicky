'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { GlobalTheme } from '@/types'

interface ThemeContextValue {
  theme: GlobalTheme | null
}

const ThemeContext = createContext<ThemeContextValue>({ theme: null })

export function useTheme() {
  return useContext(ThemeContext)
}

interface ThemeProviderProps {
  theme: GlobalTheme | null
  children: ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  // Generate CSS variables from theme
  const cssVariables = theme ? generateCSSVariables(theme) : {}

  // Add font family to inline styles
  const wrapperStyles = {
    ...cssVariables,
  } as React.CSSProperties

  return (
    <ThemeContext.Provider value={{ theme }}>
      {theme && (
        <style>{`
          .theme-wrapper,
          .theme-wrapper * {
            font-family: ${theme.typography.fontFamily} !important;
          }
        `}</style>
      )}
      <div className="theme-wrapper" style={wrapperStyles}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

function generateCSSVariables(theme: GlobalTheme): Record<string, string> {
  const vars: Record<string, string> = {}

  // Typography
  vars['--font-family'] = theme.typography.fontFamily

  // Heading sizes
  const headingSizes = {
    small: '20px',
    medium: '28px',
    large: '36px',
    xl: '48px',
  }
  vars['--heading-size'] = headingSizes[theme.typography.headingSize]

  // Body sizes
  const bodySizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
  }
  vars['--body-size'] = bodySizes[theme.typography.bodySize]

  // Colors
  vars['--color-primary'] = theme.colors.primary
  vars['--color-secondary'] = theme.colors.secondary
  vars['--color-accent'] = theme.colors.accent
  vars['--color-background'] = theme.colors.background
  vars['--color-text'] = theme.colors.text

  // Button/Module Roundness
  const roundnessMap = {
    square: '0px',
    'slightly-rounded': '6px',
    rounded: '12px',
    pill: '9999px',
  }
  vars['--border-radius'] = roundnessMap[theme.layout.buttonRoundness]

  // Section Spacing
  const sectionSpacingMap = {
    tight: '16px',
    normal: '32px',
    loose: '64px',
  }
  vars['--section-spacing'] = sectionSpacingMap[theme.layout.sectionSpacing]

  // Module Spacing
  const moduleSpacingMap = {
    tight: '8px',
    normal: '16px',
    loose: '24px',
  }
  vars['--module-spacing'] = moduleSpacingMap[theme.layout.moduleSpacing]

  return vars
}
