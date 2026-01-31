import { useState, type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, GripVertical, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useResumeStore } from '../store/resumeStore'

interface Props {
  id: string
  children: ReactNode
  onAddItem?: () => void
}

export function SectionWrapper({ id, children, onAddItem }: Props) {
  const { t } = useTranslation()
  const { isEditMode, removeSection } = useResumeStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !isEditMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (!isEditMode) {
    return <>{children}</>
  }

  const handleDelete = () => {
    if (showConfirm) {
      removeSection(id)
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group print:static">
      <div
        className="absolute -left-10 top-[10px] flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
        style={{ transform: 'translateY(calc(-100% + 28px))' }}
      >
        {onAddItem && (
          <button
            onClick={onAddItem}
            className="w-7 h-7 rounded bg-gray-100 hover:bg-green-100 text-gray-500 hover:text-green-600 flex items-center justify-center"
            title={t('tooltips.addItem')}
          >
            <Plus size={14} />
          </button>
        )}
        <button
          onClick={handleDelete}
          onBlur={() => setShowConfirm(false)}
          className={`w-7 h-7 rounded flex items-center justify-center ${
            showConfirm
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600'
          }`}
          title={showConfirm ? t('common.confirm') : t('tooltips.deleteSection')}
        >
          <Trash2 size={14} />
        </button>
        <button
          {...attributes}
          {...listeners}
          className="w-7 h-7 rounded bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 flex items-center justify-center cursor-grab active:cursor-grabbing"
          title={t('tooltips.drag')}
        >
          <GripVertical size={14} />
        </button>
      </div>

      {children}
    </div>
  )
}
