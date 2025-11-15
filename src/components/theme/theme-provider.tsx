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

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div style={cssVariables as React.CSSProperties}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

function generateCSSVariables(theme: GlobalTheme): Record<string, string> {
  const vars: Record<string, string> = {}

  // Typography
  vars['--font-family'] = theme.typography.fontFamily
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    vars[`--font-size-${key}`] = value
  })
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    vars[`--font-weight-${key}`] = value.toString()
  })
  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
    vars[`--line-height-${key}`] = value.toString()
  })
  Object.entries(theme.typography.letterSpacing).forEach(([key, value]) => {
    vars[`--letter-spacing-${key}`] = value
  })

  // Colors
  vars['--color-primary'] = theme.colors.primary
  vars['--color-secondary'] = theme.colors.secondary
  vars['--color-accent'] = theme.colors.accent
  vars['--color-bg-light'] = theme.colors.background.light
  vars['--color-bg-dark'] = theme.colors.background.dark
  vars['--color-text-heading'] = theme.colors.text.heading
  vars['--color-text-body'] = theme.colors.text.body
  vars['--color-text-muted'] = theme.colors.text.muted
  vars['--color-text-inverse'] = theme.colors.text.inverse
  vars['--color-border'] = theme.colors.border
  vars['--color-success'] = theme.colors.success
  vars['--color-warning'] = theme.colors.warning
  vars['--color-error'] = theme.colors.error

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value
  })

  // Effects
  Object.entries(theme.effects.borderRadius).forEach(([key, value]) => {
    vars[`--radius-${key}`] = value
  })
  Object.entries(theme.effects.shadow).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value
  })

  return vars
}
