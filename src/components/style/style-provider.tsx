'use client'

import { ReactNode } from 'react'
import type { ProfileStyle } from '@/types'

interface StyleProviderProps {
  style: Partial<ProfileStyle> | null
  children: ReactNode
}

const DEFAULT_STYLE: ProfileStyle = {
  fontFamily: 'Inter, system-ui, sans-serif',
  headingSize: 'large',
  bodySize: 'medium',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#ec4899',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  buttonRoundness: 'rounded',
  sectionSpacing: 'normal',
  moduleSpacing: 'normal',
  animation: 'fade-up',
}

export function StyleProvider({ style, children }: StyleProviderProps) {
  const mergedStyle = { ...DEFAULT_STYLE, ...style }

  const roundnessMap = {
    square: '0px',
    'slightly-rounded': '6px',
    rounded: '12px',
    pill: '9999px',
  }

  const headingSizes = {
    small: '24px',
    medium: '32px',
    large: '40px',
    xl: '56px',
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
    <>
      <style>{`
        .style-wrapper {
          --color-primary: ${mergedStyle.primaryColor};
          --color-secondary: ${mergedStyle.secondaryColor};
          --color-accent: ${mergedStyle.accentColor};
          --color-background: ${mergedStyle.backgroundColor};
          --color-text: ${mergedStyle.textColor};
          --border-radius: ${roundnessMap[mergedStyle.buttonRoundness]};
          --heading-size: ${headingSizes[mergedStyle.headingSize]};
          --body-size: ${bodySizes[mergedStyle.bodySize]};
          --section-spacing: ${sectionSpacingMap[mergedStyle.sectionSpacing]};
          --module-spacing: ${moduleSpacingMap[mergedStyle.moduleSpacing]};
        }

        .style-wrapper,
        .style-wrapper * {
          font-family: ${mergedStyle.fontFamily} !important;
        }
      `}</style>
      <div className="style-wrapper">
        {children}
      </div>
    </>
  )
}
