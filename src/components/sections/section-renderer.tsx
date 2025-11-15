'use client'

import { motion } from 'framer-motion'
import type { SectionWithModules } from '@/types'
import { ModuleRenderer } from '@/components/modules/module-renderer'

interface SectionRendererProps {
  section: SectionWithModules
  profileId: string
  sectionIndex: number
}

export function SectionRenderer({ section, profileId, sectionIndex }: SectionRendererProps) {
  const { layout, style, modules } = section

  // Build style object from section style config
  const sectionStyles: React.CSSProperties = {
    paddingTop: `${style.padding.top}px`,
    paddingBottom: `${style.padding.bottom}px`,
    paddingLeft: `${style.padding.left}px`,
    paddingRight: `${style.padding.right}px`,
    marginTop: `${style.margin.top}px`,
    marginBottom: `${style.margin.bottom}px`,
    borderRadius: `${style.borderRadius}px`,
  }

  // Background handling
  if (style.backgroundGradient?.enabled && style.backgroundGradient.colors.length > 0) {
    const { type, direction, colors } = style.backgroundGradient
    if (type === 'linear') {
      sectionStyles.background = `linear-gradient(${direction || 'to bottom'}, ${colors.join(', ')})`
    } else {
      sectionStyles.background = `radial-gradient(circle, ${colors.join(', ')})`
    }
  } else if (style.backgroundImage) {
    sectionStyles.backgroundImage = `url(${style.backgroundImage})`
    sectionStyles.backgroundSize = 'cover'
    sectionStyles.backgroundPosition = 'center'
  } else if (style.backgroundColor) {
    sectionStyles.backgroundColor = style.backgroundColor
  }

  // Shadow classes
  const shadowClass = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  }[style.shadow] || ''

  // Container class for full width
  const containerClass = style.fullWidth ? 'w-full' : 'max-w-4xl mx-auto'

  // Grid column classes
  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2 grid-cols-1',
    3: 'md:grid-cols-3 grid-cols-1',
    4: 'md:grid-cols-4 grid-cols-1',
  }[layout.columns]

  // Mobile column classes
  const mobileGridCols = layout.mobileColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'

  // Alignment classes
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[layout.alignment]

  // Group modules by column
  const columnGroups: Module[][] = []
  for (let i = 0; i < layout.columns; i++) {
    columnGroups[i] = []
  }

  // Sort modules into their respective columns
  modules
    .filter(m => m.active)
    .sort((a, b) => a.order - b.order)
    .forEach(module => {
      const colIndex = module.column_index || 0
      if (columnGroups[colIndex]) {
        columnGroups[colIndex].push(module)
      }
    })

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: sectionIndex * 0.1 }}
      className={`${containerClass} ${shadowClass}`}
      style={sectionStyles}
    >
      {section.title && (
        <h2 className="text-2xl font-bold mb-6 text-center">{section.title}</h2>
      )}

      <div
        className={`grid ${gridCols} ${mobileGridCols} gap-${layout.gap / 4} ${alignmentClass}`}
        style={{ gap: `${layout.gap}px` }}
      >
        {columnGroups.map((columnModules, colIndex) => (
          <div key={colIndex} className="flex flex-col space-y-4">
            {columnModules.map((module, moduleIndex) => (
              <ModuleRenderer
                key={module.id}
                module={module}
                profileId={profileId}
                index={moduleIndex}
                allModules={modules}
              />
            ))}
          </div>
        ))}
      </div>
    </motion.section>
  )
}
