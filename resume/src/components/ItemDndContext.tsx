import { createContext, type ReactNode } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useResumeStore } from '../store/resumeStore'

interface ItemDndContextType {
  activeId: string | null
  activeType: 'project' | 'career' | null
}

const ItemDndCtx = createContext<ItemDndContextType>({ activeId: null, activeType: null })

interface Props {
  children: ReactNode
}

function parseItemId(
  id: string
): { type: 'project' | 'career'; sectionId: string; index: number } | null {
  const parts = id.split(':')
  if (parts.length !== 3) return null
  const type = parts[0] as 'project' | 'career'
  if (type !== 'project' && type !== 'career') return null
  return {
    type,
    sectionId: parts[1],
    index: parseInt(parts[2], 10),
  }
}

export function ItemDndProvider({ children }: Props) {
  const { t } = useTranslation()
  const { moveItem, isEditMode } = useResumeStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'project' | 'career' | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string
    const parsed = parseItemId(id)
    if (parsed) {
      setActiveId(id)
      setActiveType(parsed.type)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveType(null)

    if (!over || active.id === over.id) return

    const activeData = parseItemId(active.id as string)
    const overData = parseItemId(over.id as string)

    if (!activeData || !overData) return
    if (activeData.type !== overData.type) return

    moveItem(activeData.sectionId, overData.sectionId, activeData.index, overData.index)
  }

  if (!isEditMode) {
    return <>{children}</>
  }

  return (
    <ItemDndCtx.Provider value={{ activeId, activeType }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeId && (
            <div className="bg-white shadow-lg rounded p-2 opacity-80">{t('tooltips.drag')}...</div>
          )}
        </DragOverlay>
      </DndContext>
    </ItemDndCtx.Provider>
  )
}
