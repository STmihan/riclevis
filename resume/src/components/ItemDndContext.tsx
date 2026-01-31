/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'
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
import { useResumeContext } from '../context/ResumeContext'

interface ItemDndContextType {
  activeId: string | null
  activeType: 'project' | 'career' | null
}

const ItemDndCtx = createContext<ItemDndContextType>({ activeId: null, activeType: null })

export function useItemDnd() {
  return useContext(ItemDndCtx)
}

interface Props {
  children: ReactNode
}

// Parse item id: "project:sectionId:itemIndex" or "career:sectionId:itemIndex"
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
  const { moveItem, isEditMode } = useResumeContext()
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
    // Only allow moving within same type (project to project, career to career)
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
            <div className="bg-white shadow-lg rounded p-2 opacity-80">Перетаскивание...</div>
          )}
        </DragOverlay>
      </DndContext>
    </ItemDndCtx.Provider>
  )
}
