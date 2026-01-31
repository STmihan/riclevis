import { X, Plus, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'
import type { ProjectsContent, ProjectItem, LocalizedString } from '../../types/resume'
import { EditableText } from '../EditableText'
import { RichText } from '../RichText'
import { useResumeStore } from '../../store/resumeStore'
import { useUIStore } from '../../store/uiStore'
import { usePopup } from '../../context/PopupContext'
import { useLocalized, getLocalizedField, setLocalizedField } from '../../utils/localized'

interface SortableProjectItemProps {
  item: ProjectItem
  index: number
  sectionId: string
  onRemove: () => void
  onChange: (updates: Partial<ProjectItem>) => void
  onEditLink: () => void
}

function SortableProjectItem({
  item,
  index,
  sectionId,
  onRemove,
  onChange,
  onEditLink,
}: SortableProjectItemProps) {
  const { t } = useTranslation()
  const isEditMode = useResumeStore((s) => s.isEditMode)
  const displayLang = useUIStore((s) => s.displayLang)
  const loc = useLocalized()
  const itemId = `project:${sectionId}:${index}`

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
    disabled: !isEditMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleNameChange = (value: string) => {
    onChange({ name: setLocalizedField(item.name, displayLang, value) })
  }

  const handleDurationChange = (value: string) => {
    onChange({ duration: setLocalizedField(item.duration, displayLang, value) })
  }

  const handleDescriptionChange = (value: string) => {
    onChange({ description: setLocalizedField(item.description, displayLang, value) })
  }

  return (
    <li ref={setNodeRef} style={{ ...style, marginBottom: '20px' }} className="group relative">
      {isEditMode && (
        <div className="absolute -left-6 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
          <button
            {...attributes}
            {...listeners}
            className="w-5 h-5 rounded bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 flex items-center justify-center cursor-grab active:cursor-grabbing"
            title={t('tooltips.drag')}
          >
            <GripVertical size={10} />
          </button>
          <button
            onClick={onRemove}
            className="w-5 h-5 rounded bg-red-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"
            title={t('common.delete')}
          >
            <X size={10} />
          </button>
        </div>
      )}

      <div className="flex justify-between" style={{ marginBottom: '5px' }}>
        <span style={{ fontWeight: 'bold' }}>
          <EditableText
            value={isEditMode ? getLocalizedField(item.name, displayLang) : loc(item.name)}
            onChange={handleNameChange}
          />
        </span>
        <span style={{ fontStyle: 'italic', color: '#666', fontSize: '13px' }}>
          <EditableText
            value={isEditMode ? getLocalizedField(item.duration, displayLang) : loc(item.duration)}
            onChange={handleDurationChange}
          />
        </span>
      </div>
      <div>
        <RichText
          value={
            isEditMode ? getLocalizedField(item.description, displayLang) : loc(item.description)
          }
          onChange={handleDescriptionChange}
        />

        {item.link ? (
          <div className="mt-1">
            {isEditMode ? (
              <span className="group/link relative inline-flex items-center">
                <button
                  onClick={onEditLink}
                  className="text-blue-600 hover:text-blue-800 underline text-[13px] print:text-[#555] print:no-underline"
                >
                  {item.link.text}
                </button>
                <button
                  onClick={() => onChange({ link: undefined })}
                  className="absolute left-full w-4 h-4 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/link:opacity-100 transition-opacity flex items-center justify-center print:hidden"
                  title={t('popup.removeLink')}
                >
                  <X size={8} />
                </button>
              </span>
            ) : (
              <a
                href={item.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: '#555', fontSize: '13px' }}
              >
                {item.link.text}
              </a>
            )}
          </div>
        ) : isEditMode ? (
          <button
            onClick={onEditLink}
            className="inline-flex items-center text-gray-400 hover:text-blue-500 ml-1 print:hidden opacity-0 group-hover:opacity-100 transition-opacity align-middle"
            title={t('popup.addLink')}
          >
            <Plus size={12} />
          </button>
        ) : null}
      </div>
    </li>
  )
}

interface Props {
  id: string
  title: LocalizedString
  content: ProjectsContent
}

export function ProjectsSection({ id, title, content }: Props) {
  const { updateSection, isEditMode } = useResumeStore()
  const displayLang = useUIStore((s) => s.displayLang)
  const loc = useLocalized()
  const { openLinkPopup } = usePopup()

  const handleTitleChange = (newTitle: string) => {
    updateSection(id, { title: setLocalizedField(title, displayLang, newTitle) })
  }

  const handleItemChange = (index: number, updates: Partial<ProjectItem>) => {
    const newItems = content.items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    updateSection(id, { content: { items: newItems } })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = content.items.filter((_, i) => i !== index)
    updateSection(id, { content: { items: newItems } })
  }

  const handleEditLink = (itemIndex: number) => {
    const item = content.items[itemIndex]
    const currentLink = item.link

    openLinkPopup({
      initialUrl: currentLink?.url || '',
      initialText: currentLink?.text || '',
      onSubmit: (url, text) => {
        if (url) {
          handleItemChange(itemIndex, { link: { url, text } })
        } else {
          handleItemChange(itemIndex, { link: undefined })
        }
      },
      onRemove: currentLink
        ? () => {
            handleItemChange(itemIndex, { link: undefined })
          }
        : undefined,
    })
  }

  const itemIds = content.items.map((_, i) => `project:${id}:${i}`)

  return (
    <section>
      <h2
        style={{
          fontSize: '18px',
          textTransform: 'uppercase',
          color: '#333',
          borderBottom: '2px solid #333',
          paddingBottom: '5px',
          marginBottom: '20px',
          marginTop: '10px',
          fontWeight: 'bold',
        }}
      >
        <EditableText
          value={isEditMode ? getLocalizedField(title, displayLang) : loc(title)}
          onChange={handleTitleChange}
        />
      </h2>

      <ul className="list-none" style={{ fontSize: '14px' }}>
        {isEditMode ? (
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {content.items.map((item, i) => (
              <SortableProjectItem
                key={i}
                item={item}
                index={i}
                sectionId={id}
                onRemove={() => handleRemoveItem(i)}
                onChange={(updates) => handleItemChange(i, updates)}
                onEditLink={() => handleEditLink(i)}
              />
            ))}
          </SortableContext>
        ) : (
          content.items.map((item, i) => (
            <li key={i} style={{ marginBottom: '20px' }}>
              <div className="flex justify-between" style={{ marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>{loc(item.name)}</span>
                <span style={{ fontStyle: 'italic', color: '#666', fontSize: '13px' }}>
                  {loc(item.duration)}
                </span>
              </div>
              <div>
                <RichText value={loc(item.description)} onChange={() => {}} />
                {item.link && (
                  <div className="mt-1">
                    <a
                      href={item.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: '#555', fontSize: '13px' }}
                    >
                      {item.link.text}
                    </a>
                  </div>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
