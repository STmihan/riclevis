import { X, Plus, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CareerContent, CareerItem, LinkItem } from '../../types/resume'
import { EditableText } from '../EditableText'
import { RichText } from '../RichText'
import { useResumeContext } from '../../context/ResumeContext'
import { usePopup } from '../../context/PopupContext'

interface SortableCareerItemProps {
  item: CareerItem
  index: number
  sectionId: string
  onRemove: () => void
  onChange: (updates: Partial<CareerItem>) => void
  onAddLink: () => void
  onEditLink: (linkIndex: number) => void
}

function SortableCareerItem({
  item,
  index,
  sectionId,
  onRemove,
  onChange,
  onAddLink,
  onEditLink,
}: SortableCareerItemProps) {
  const { isEditMode } = useResumeContext()
  const itemId = `career:${sectionId}:${index}`

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
    disabled: !isEditMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginBottom: '20px',
        paddingLeft: '15px',
        borderLeft: '3px solid #ddd',
      }}
      className="group relative"
    >
      {/* Drag handle and Delete button */}
      {isEditMode && (
        <div className="absolute -left-6 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
          <button
            {...attributes}
            {...listeners}
            className="w-5 h-5 rounded bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 flex items-center justify-center cursor-grab active:cursor-grabbing"
            title="Перетащить"
          >
            <GripVertical size={10} />
          </button>
          <button
            onClick={onRemove}
            className="w-5 h-5 rounded bg-red-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"
            title="Удалить"
          >
            <X size={10} />
          </button>
        </div>
      )}

      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
        <EditableText value={item.title} onChange={(title) => onChange({ title })} />
      </div>
      <div style={{ fontSize: '14px', color: '#444' }}>
        <RichText value={item.description} onChange={(description) => onChange({ description })} />

        {/* Links - flex layout with max 4 per row */}
        {item.links && item.links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1" style={{ fontSize: '13px' }}>
            {item.links.map((link, j, arr) => {
              const isLast = j === arr.length - 1
              return (
                <span
                  key={j}
                  className="group/link inline-flex items-center"
                  style={{ maxWidth: '25%' }}
                >
                  {isEditMode ? (
                    <>
                      <button
                        onClick={() => onEditLink(j)}
                        className="text-blue-600 hover:text-blue-800 underline truncate print:text-[#555] print:no-underline"
                        title={link.text}
                      >
                        {link.text}
                      </button>
                      <button
                        onClick={() => {
                          const newLinks = item.links!.filter((_, k) => k !== j)
                          onChange({ links: newLinks.length > 0 ? newLinks : undefined })
                        }}
                        className="ml-0.5 w-4 h-4 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/link:opacity-100 transition-opacity flex items-center justify-center print:hidden shrink-0"
                        title="Удалить ссылку"
                      >
                        <X size={8} />
                      </button>
                      {/* Add button after last link */}
                      {isLast && (
                        <button
                          onClick={onAddLink}
                          className="ml-0.5 w-4 h-4 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center print:hidden shrink-0"
                          title="Добавить ссылку"
                        >
                          <Plus size={8} />
                        </button>
                      )}
                    </>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#555] underline truncate"
                      title={link.text}
                    >
                      {link.text}
                    </a>
                  )}
                </span>
              )
            })}
          </div>
        )}

        {/* Add link button - inline after description when no links */}
        {isEditMode && (!item.links || item.links.length === 0) && (
          <button
            onClick={onAddLink}
            className="inline-flex items-center ml-1 text-gray-400 hover:text-blue-500 print:hidden opacity-0 group-hover:opacity-100 transition-opacity align-middle"
            title="Добавить ссылку"
          >
            <Plus size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

interface Props {
  id: string
  title: string
  content: CareerContent
}

export function CareerSection({ id, title, content }: Props) {
  const { updateSection, isEditMode } = useResumeContext()
  const { openLinkPopup } = usePopup()

  const handleTitleChange = (newTitle: string) => {
    updateSection(id, { title: newTitle })
  }

  const handleRoleChange = (role: string) => {
    updateSection(id, { content: { ...content, role } })
  }

  const handlePeriodChange = (period: string) => {
    updateSection(id, { content: { ...content, period } })
  }

  const handleItemChange = (index: number, updates: Partial<CareerItem>) => {
    const newItems = content.items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    updateSection(id, { content: { ...content, items: newItems } })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = content.items.filter((_, i) => i !== index)
    updateSection(id, { content: { ...content, items: newItems } })
  }

  const handleAddLink = (itemIndex: number) => {
    openLinkPopup({
      initialUrl: '',
      initialText: '',
      onSubmit: (url, text) => {
        if (url) {
          const item = content.items[itemIndex]
          const newLink: LinkItem = { url, text }
          const newLinks = [...(item.links || []), newLink]
          handleItemChange(itemIndex, { links: newLinks })
        }
      },
    })
  }

  const handleEditLink = (itemIndex: number, linkIndex: number) => {
    const item = content.items[itemIndex]
    const currentLink = item.links?.[linkIndex]

    openLinkPopup({
      initialUrl: currentLink?.url || '',
      initialText: currentLink?.text || '',
      onSubmit: (url, text) => {
        if (url && item.links) {
          const newLinks = [...item.links]
          newLinks[linkIndex] = { url, text }
          handleItemChange(itemIndex, { links: newLinks })
        }
      },
      onRemove: () => {
        if (item.links) {
          const newLinks = item.links.filter((_, i) => i !== linkIndex)
          handleItemChange(itemIndex, { links: newLinks.length > 0 ? newLinks : undefined })
        }
      },
    })
  }

  const itemIds = content.items.map((_, i) => `career:${id}:${i}`)

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
        <EditableText value={title} onChange={handleTitleChange} />
      </h2>

      <div style={{ marginBottom: '25px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '15px',
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
            <EditableText value={content.role} onChange={handleRoleChange} />
          </span>
          <span style={{ fontStyle: 'italic', fontSize: '14px', color: '#666' }}>
            <EditableText value={content.period} onChange={handlePeriodChange} />
          </span>
        </div>

        <div>
          {isEditMode ? (
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              {content.items.map((item, i) => (
                <SortableCareerItem
                  key={i}
                  item={item}
                  index={i}
                  sectionId={id}
                  onRemove={() => handleRemoveItem(i)}
                  onChange={(updates) => handleItemChange(i, updates)}
                  onAddLink={() => handleAddLink(i)}
                  onEditLink={(linkIndex) => handleEditLink(i, linkIndex)}
                />
              ))}
            </SortableContext>
          ) : (
            content.items.map((item, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '20px',
                  paddingLeft: '15px',
                  borderLeft: '3px solid #ddd',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '14px', color: '#444' }}>
                  <RichText value={item.description} onChange={() => {}} />
                  {item.links && item.links.length > 0 && (
                    <div
                      className="mt-2 flex flex-wrap gap-x-3 gap-y-1"
                      style={{ fontSize: '13px' }}
                    >
                      {item.links.map((link, j) => (
                        <a
                          key={j}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#555] underline truncate"
                          style={{ maxWidth: '25%' }}
                          title={link.text}
                        >
                          {link.text}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
