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
  if (!theme) {
    return <ThemeContext.Provider value={{ theme: null }}>{children}</ThemeContext.Provider>
  }

  // Generate CSS custom properties
  const roundnessMap = {
    square: '0px',
    'slightly-rounded': '6px',
    rounded: '12px',
    pill: '9999px',
  }

  const headingSizes = {
    small: '20px',
    medium: '28px',
    large: '36px',
    xl: '48px',
  }

  const bodySizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
  }

  const sectionSpacingMap = {
    tight: '16px',
    normal: '32px',
    loose: '64px',
  }

  const moduleSpacingMap = {
    tight: '8px',
    normal: '16px',
    loose: '24px',
  }

  return (
    <ThemeContext.Provider value={{ theme }}>
      <style>{`
        .theme-wrapper {
          --color-primary: ${theme.colors.primary};
          --color-secondary: ${theme.colors.secondary};
          --color-accent: ${theme.colors.accent};
          --color-background: ${theme.colors.background};
          --color-text: ${theme.colors.text};
          --border-radius: ${roundnessMap[theme.layout.buttonRoundness]};
          --heading-size: ${headingSizes[theme.typography.headingSize]};
          --body-size: ${bodySizes[theme.typography.bodySize]};
          --section-spacing: ${sectionSpacingMap[theme.layout.sectionSpacing]};
          --module-spacing: ${moduleSpacingMap[theme.layout.moduleSpacing]};
        }

        .theme-wrapper,
        .theme-wrapper * {
          font-family: ${theme.typography.fontFamily} !important;
        }
      `}</style>
      <div className="theme-wrapper">
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
