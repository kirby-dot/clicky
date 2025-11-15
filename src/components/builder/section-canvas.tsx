'use client'

import { motion } from 'framer-motion'
import { Plus, GripVertical, Edit2, Trash2, Eye, EyeOff, Copy, Layout } from 'lucide-react'
import type { Section, Module } from '@/types'
import { ModuleRenderer } from '../modules/module-renderer'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'

interface SectionCanvasProps {
  sections: Section[]
  modules: Module[]
  profileId: string
  onEditSection: (section: Section) => void
  onDeleteSection: (id: string) => void
  onSelectModule: (module: Module) => void
  onDeleteModule: (id: string) => void
  onToggleActive: (module: Module) => void
  selectedModuleId?: string
}

export function SectionCanvas({
  sections,
  modules,
  profileId,
  onEditSection,
  onDeleteSection,
  onSelectModule,
  onDeleteModule,
  onToggleActive,
  selectedModuleId,
}: SectionCanvasProps) {
  const modulesWithoutSection = modules.filter(m => !m.section_id)

  return (
    <div className="space-y-6 p-6">
      {/* Render Sections */}
      {sections
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const sectionModules = modules.filter(m => m.section_id === section.id)

          return (
            <SectionContainer
              key={section.id}
              section={section}
              modules={sectionModules}
              profileId={profileId}
              onEditSection={onEditSection}
              onDeleteSection={onDeleteSection}
              onSelectModule={onSelectModule}
              onDeleteModule={onDeleteModule}
              onToggleActive={onToggleActive}
              selectedModuleId={selectedModuleId}
            />
          )
        })}

      {/* Modules Without Section */}
      {modulesWithoutSection.length > 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">
              Modules (No Section)
            </h3>
            <span className="text-xs text-gray-500">
              {modulesWithoutSection.length} module{modulesWithoutSection.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {modulesWithoutSection.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                profileId={profileId}
                index={index}
                isSelected={selectedModuleId === module.id}
                onSelect={() => onSelectModule(module)}
                onDelete={() => onDeleteModule(module.id)}
                onToggleActive={() => onToggleActive(module)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sections.length === 0 && modulesWithoutSection.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Layout className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">No sections yet</p>
            <p className="text-sm text-gray-500">Create a section to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionContainer({
  section,
  modules,
  profileId,
  onEditSection,
  onDeleteSection,
  onSelectModule,
  onDeleteModule,
  onToggleActive,
  selectedModuleId,
}: {
  section: Section
  modules: Module[]
  profileId: string
  onEditSection: (section: Section) => void
  onDeleteSection: (id: string) => void
  onSelectModule: (module: Module) => void
  onDeleteModule: (id: string) => void
  onToggleActive: (module: Module) => void
  selectedModuleId?: string
}) {
  const { layout, style } = section
  const columnCount = layout.columns

  // Group modules by column
  const columnModules: Module[][] = Array.from({ length: columnCount }, () => [])
  modules.forEach((module) => {
    const colIndex = module.column_index || 0
    if (columnModules[colIndex]) {
      columnModules[colIndex].push(module)
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-purple-200 rounded-xl overflow-hidden bg-white shadow-sm"
    >
      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Layout className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {section.title || 'Untitled Section'}
              </h3>
              <p className="text-xs text-gray-500">
                {columnCount} column{columnCount !== 1 ? 's' : ''} • {modules.length} module{modules.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditSection(section)}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
              title="Edit section"
            >
              <Edit2 className="w-4 h-4 text-purple-600" />
            </button>
            <button
              onClick={() => onDeleteSection(section.id)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Section Columns */}
      <div
        className="grid gap-4 p-4"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: `${layout.gap}px`,
        }}
      >
        {columnModules.map((colMods, colIndex) => (
          <ColumnDropZone
            key={colIndex}
            sectionId={section.id}
            columnIndex={colIndex}
            modules={colMods}
            profileId={profileId}
            onSelectModule={onSelectModule}
            onDeleteModule={onDeleteModule}
            onToggleActive={onToggleActive}
            selectedModuleId={selectedModuleId}
          />
        ))}
      </div>
    </motion.div>
  )
}

function ColumnDropZone({
  sectionId,
  columnIndex,
  modules,
  profileId,
  onSelectModule,
  onDeleteModule,
  onToggleActive,
  selectedModuleId,
}: {
  sectionId: string
  columnIndex: number
  modules: Module[]
  profileId: string
  onSelectModule: (module: Module) => void
  onDeleteModule: (id: string) => void
  onToggleActive: (module: Module) => void
  selectedModuleId?: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${sectionId}-col-${columnIndex}`,
    data: {
      type: 'column',
      sectionId,
      columnIndex,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] border-2 border-dashed rounded-lg p-3 transition-all ${
        isOver
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-300 bg-gray-50 hover:border-purple-300'
      }`}
    >
      {modules.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[180px]">
          <div className="text-center text-gray-400">
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs">Drop module here</p>
            <p className="text-xs">Column {columnIndex + 1}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              profileId={profileId}
              index={index}
              isSelected={selectedModuleId === module.id}
              onSelect={() => onSelectModule(module)}
              onDelete={() => onDeleteModule(module.id)}
              onToggleActive={() => onToggleActive(module)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ModuleCard({
  module,
  profileId,
  index,
  isSelected,
  onSelect,
  onDelete,
  onToggleActive,
}: {
  module: Module
  profileId: string
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: module.id,
    data: {
      type: 'module',
      module,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`relative group cursor-pointer transition-all rounded-lg overflow-hidden ${
        isSelected
          ? 'ring-2 ring-purple-500 ring-offset-2'
          : 'hover:ring-2 hover:ring-gray-300'
      } ${!module.active ? 'opacity-60' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-white/90 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </div>

      {/* Module Preview */}
      <div className="pointer-events-none scale-90 origin-top-left">
        <ModuleRenderer module={module} profileId={profileId} index={index} />
      </div>

      {/* Quick Actions */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleActive()
          }}
          className="p-1.5 bg-white/90 rounded shadow-sm hover:bg-white"
          title={module.active ? 'Hide' : 'Show'}
        >
          {module.active ? (
            <Eye className="w-3.5 h-3.5 text-gray-600" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1.5 bg-white/90 rounded shadow-sm hover:bg-red-50"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
        </button>
      </div>
    </div>
  )
}
