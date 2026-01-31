import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Link, Plus, X, GripVertical, Settings } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Sidebar as SidebarType, Contact, Language } from '../types/resume'
import { EditableText } from './EditableText'
import { useResumeContext } from '../context/ResumeContext'
import { usePopup } from '../context/PopupContext'

const AVAILABLE_ICONS = ['email.svg', 'telegram.svg', 'artstation.svg', 'place.svg']

// Section header with optional add button
function SectionHeader({ title, onAdd }: { title: string; onAdd?: () => void }) {
  const { isEditMode } = useResumeContext()

  return (
    <div
      className="flex items-center justify-between"
      style={{
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: '2px solid #ccc',
        paddingBottom: '5px',
        marginBottom: '15px',
        fontWeight: 'bold',
      }}
    >
      <span>{title}</span>
      {isEditMode && onAdd && (
        <button
          onClick={onAdd}
          className="text-gray-400 hover:text-green-500 transition-colors"
          title="Добавить"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  )
}

// Sortable contact item
function SortableContact({
  contact,
  index,
  onUpdate,
  onDelete,
  onEditLink,
  iconPickerOpen,
  setIconPickerOpen,
}: {
  contact: Contact
  index: number
  onUpdate: (updates: Partial<Contact>) => void
  onDelete: () => void
  onEditLink: () => void
  iconPickerOpen: number | null
  setIconPickerOpen: (index: number | null) => void
}) {
  const { isEditMode } = useResumeContext()
  const iconPickerRef = useRef<HTMLDivElement>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `contact-${index}`,
    disabled: !isEditMode,
  })

  // Close icon picker on outside mousedown
  useEffect(() => {
    if (iconPickerOpen !== index) return

    const handleMouseDown = (e: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
        setIconPickerOpen(null)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [iconPickerOpen, index, setIconPickerOpen])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, marginBottom: '12px', fontSize: '14px' }}
      className="group/contact relative flex items-center gap-2.5"
    >
      {/* Drag handle - absolute positioned */}
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing opacity-0 group-hover/contact:opacity-100 transition-opacity"
        >
          <GripVertical size={12} />
        </button>
      )}

      {/* Icon with picker */}
      <div className="relative shrink-0 flex items-center justify-center">
        {isEditMode ? (
          <button
            onClick={() => setIconPickerOpen(iconPickerOpen === index ? null : index)}
            className="hover:opacity-100 transition-opacity"
            title="Изменить иконку"
          >
            <img
              src={`/icons/${contact.icon}`}
              alt=""
              width={16}
              height={16}
              style={{ opacity: 0.7 }}
            />
          </button>
        ) : (
          <img
            src={`/icons/${contact.icon}`}
            alt=""
            width={16}
            height={16}
            style={{ opacity: 0.7 }}
          />
        )}
        {/* Icon picker dropdown */}
        {isEditMode && iconPickerOpen === index && (
          <div
            ref={iconPickerRef}
            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg p-2 flex gap-2 z-10"
          >
            {AVAILABLE_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => {
                  onUpdate({ icon })
                  setIconPickerOpen(null)
                }}
                className={`p-1 rounded hover:bg-gray-100 ${contact.icon === icon ? 'bg-blue-100' : ''}`}
                title={icon.replace('.svg', '')}
              >
                <img
                  src={`/icons/${icon}`}
                  alt={icon}
                  width={16}
                  height={16}
                  className={`max-w-4`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contact label */}
      <div className="flex-1 min-w-0 truncate">
        {isEditMode ? (
          <span className="block truncate">
            <EditableText value={contact.label} onChange={(label) => onUpdate({ label })} />
          </span>
        ) : contact.url ? (
          <a
            href={contact.url}
            className="block truncate"
            style={{ color: '#222', textDecoration: 'none' }}
            title={contact.label}
          >
            {contact.label}
          </a>
        ) : (
          <span className="block truncate" title={contact.label}>
            {contact.label}
          </span>
        )}
      </div>

      {/* Action buttons - absolute positioned outside */}
      {isEditMode && (
        <div className="absolute left-full ml-2 flex items-center gap-0.5 opacity-0 group-hover/contact:opacity-100 transition-opacity bg-white rounded shadow-sm border border-gray-200 px-1 py-0.5">
          <button
            onClick={onEditLink}
            className={`p-0.5 rounded ${
              contact.url
                ? 'text-blue-500 hover:bg-blue-50'
                : 'text-gray-400 hover:text-blue-500 hover:bg-gray-50'
            }`}
            title={contact.url ? 'Редактировать ссылку' : 'Добавить ссылку'}
          >
            <Link size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
            title="Удалить"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

// Sortable simple item (for skills, software)
function SortableItem({
  item,
  index,
  prefix,
  onChange,
  onDelete,
}: {
  item: string
  index: number
  prefix: string
  onChange: (value: string) => void
  onDelete: () => void
}) {
  const { isEditMode } = useResumeContext()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${prefix}-${index}`,
    disabled: !isEditMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={{ ...style, marginBottom: '6px', fontSize: '14px' }}
      className="group/item relative truncate"
    >
      {/* Drag handle - absolute */}
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing opacity-0 group-hover/item:opacity-100 transition-opacity"
        >
          <GripVertical size={10} />
        </button>
      )}
      <span className="truncate">
        <EditableText value={item} onChange={onChange} />
      </span>
      {/* Delete button - absolute */}
      {isEditMode && (
        <button
          onClick={onDelete}
          className="absolute -right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
        >
          <X size={10} />
        </button>
      )}
    </li>
  )
}

// Sortable language item
function SortableLanguage({
  lang,
  index,
  onChangeName,
  onChangeLevel,
  onDelete,
}: {
  lang: Language
  index: number
  onChangeName: (name: string) => void
  onChangeLevel: (level: string) => void
  onDelete: () => void
}) {
  const { isEditMode } = useResumeContext()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `lang-${index}`,
    disabled: !isEditMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={{ ...style, marginBottom: '6px', fontSize: '14px' }}
      className="group/item relative truncate"
    >
      {/* Drag handle - absolute */}
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing opacity-0 group-hover/item:opacity-100 transition-opacity"
        >
          <GripVertical size={10} />
        </button>
      )}
      <span className="truncate">
        <strong>
          <EditableText value={lang.name} onChange={onChangeName} />:
        </strong>{' '}
        <EditableText value={lang.level} onChange={onChangeLevel} />
      </span>
      {/* Delete button - absolute */}
      {isEditMode && (
        <button
          onClick={onDelete}
          className="absolute -right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
        >
          <X size={10} />
        </button>
      )}
    </li>
  )
}

interface Props {
  data: SidebarType
}

export function Sidebar({ data }: Props) {
  const {
    updatePortfolio,
    updateSkills,
    updateSoftware,
    updateLanguages,
    updateContacts,
    isEditMode,
  } = useResumeContext()
  const { openLinkPopup } = usePopup()
  const [iconPickerOpen, setIconPickerOpen] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  // Contact handlers
  const handleAddContact = () => {
    updateContacts([...data.contacts, { icon: 'email.svg', label: 'Новый контакт', url: '' }])
  }

  const handleContactUpdate = (index: number, updates: Partial<Contact>) => {
    const newContacts = [...data.contacts]
    newContacts[index] = { ...newContacts[index], ...updates }
    updateContacts(newContacts)
  }

  const handleEditContactLink = (index: number) => {
    const contact = data.contacts[index]
    openLinkPopup({
      initialUrl: contact.url || '',
      onSubmit: (url) => handleContactUpdate(index, { url: url || undefined }),
      onRemove: contact.url ? () => handleContactUpdate(index, { url: undefined }) : undefined,
    })
  }

  const handleContactDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = parseInt((active.id as string).split('-')[1])
      const newIndex = parseInt((over.id as string).split('-')[1])
      const newContacts = [...data.contacts]
      const [removed] = newContacts.splice(oldIndex, 1)
      newContacts.splice(newIndex, 0, removed)
      updateContacts(newContacts)
    }
  }

  // Skills handlers
  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...data.skills]
    newSkills[index] = value
    updateSkills(newSkills)
  }

  const handleSkillDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = parseInt((active.id as string).split('-')[1])
      const newIndex = parseInt((over.id as string).split('-')[1])
      const newSkills = [...data.skills]
      const [removed] = newSkills.splice(oldIndex, 1)
      newSkills.splice(newIndex, 0, removed)
      updateSkills(newSkills)
    }
  }

  // Software handlers
  const handleSoftwareChange = (index: number, value: string) => {
    const newSoftware = [...data.software]
    newSoftware[index] = value
    updateSoftware(newSoftware)
  }

  const handleSoftwareDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = parseInt((active.id as string).split('-')[1])
      const newIndex = parseInt((over.id as string).split('-')[1])
      const newSoftware = [...data.software]
      const [removed] = newSoftware.splice(oldIndex, 1)
      newSoftware.splice(newIndex, 0, removed)
      updateSoftware(newSoftware)
    }
  }

  // Language handlers
  const handleLanguageChange = (index: number, field: 'name' | 'level', value: string) => {
    const newLangs = [...data.languages]
    newLangs[index] = { ...newLangs[index], [field]: value }
    updateLanguages(newLangs)
  }

  const handleLanguageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = parseInt((active.id as string).split('-')[1])
      const newIndex = parseInt((over.id as string).split('-')[1])
      const newLangs = [...data.languages]
      const [removed] = newLangs.splice(oldIndex, 1)
      newLangs.splice(newIndex, 0, removed)
      updateLanguages(newLangs)
    }
  }

  const handleEditPortfolioLink = () => {
    openLinkPopup({
      initialUrl: data.portfolioUrl,
      onSubmit: (url) => {
        if (url) updatePortfolio(url, data.portfolioLabel)
      },
    })
  }

  const contactIds = data.contacts.map((_, i) => `contact-${i}`)
  const skillIds = data.skills.map((_, i) => `skill-${i}`)
  const softwareIds = data.software.map((_, i) => `software-${i}`)
  const langIds = data.languages.map((_, i) => `lang-${i}`)

  return (
    <aside
      className="bg-[#f4f4f4] border-r border-[#ddd] overflow-visible"
      style={{ padding: '30px 20px' }}
    >
      {/* QR Section */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <QRCodeSVG
          value={data.portfolioUrl}
          size={120}
          bgColor="#f4f4f4"
          style={{ display: 'block', margin: '0 auto 10px auto' }}
        />
        <div className="group/portfolio relative inline-block">
          {isEditMode ? (
            <>
              <span
                style={{
                  fontSize: '12px',
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderBottom: '1px solid #555',
                  fontWeight: 'bold',
                  display: 'inline-block',
                }}
              >
                <EditableText
                  value={data.portfolioLabel}
                  onChange={(label) => updatePortfolio(data.portfolioUrl, label)}
                />
              </span>
              <button
                onClick={handleEditPortfolioLink}
                className="absolute left-full ml-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 opacity-0 group-hover/portfolio:opacity-100 transition-opacity"
                title="Изменить ссылку"
              >
                <Settings size={12} />
              </button>
            </>
          ) : (
            <a
              href={data.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: '#555',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textDecoration: 'none',
                borderBottom: '1px solid #555',
                fontWeight: 'bold',
                display: 'inline-block',
              }}
            >
              {data.portfolioLabel}
            </a>
          )}
        </div>
      </div>

      {/* Contacts */}
      <div style={{ marginBottom: '30px' }}>
        <SectionHeader title="Контакты" onAdd={handleAddContact} />
        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleContactDragEnd}
          >
            <SortableContext items={contactIds} strategy={verticalListSortingStrategy}>
              {data.contacts.map((contact, i) => (
                <SortableContact
                  key={i}
                  contact={contact}
                  index={i}
                  onUpdate={(updates) => handleContactUpdate(i, updates)}
                  onDelete={() => updateContacts(data.contacts.filter((_, j) => j !== i))}
                  onEditLink={() => handleEditContactLink(i)}
                  iconPickerOpen={iconPickerOpen}
                  setIconPickerOpen={setIconPickerOpen}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          data.contacts.map((contact, i) => (
            <div
              key={i}
              style={{
                marginBottom: '12px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <img
                src={`/icons/${contact.icon}`}
                alt=""
                className="shrink-0"
                style={{ width: '16px', height: '16px', opacity: 0.7 }}
              />
              {contact.url ? (
                <a
                  href={contact.url}
                  className="truncate flex-1 min-w-0"
                  style={{ color: '#222', textDecoration: 'none' }}
                  title={contact.label}
                >
                  {contact.label}
                </a>
              ) : (
                <span className="truncate flex-1 min-w-0" title={contact.label}>
                  {contact.label}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Skills */}
      <div style={{ marginBottom: '30px' }}>
        <SectionHeader title="Навыки" onAdd={() => updateSkills([...data.skills, 'Новый навык'])} />
        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSkillDragEnd}
          >
            <SortableContext items={skillIds} strategy={verticalListSortingStrategy}>
              <ul className="list-none">
                {data.skills.map((skill, i) => (
                  <SortableItem
                    key={i}
                    item={skill}
                    index={i}
                    prefix="skill"
                    onChange={(value) => handleSkillChange(i, value)}
                    onDelete={() => updateSkills(data.skills.filter((_, j) => j !== i))}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul className="list-none">
            {data.skills.map((skill, i) => (
              <li
                key={i}
                className="truncate"
                style={{ marginBottom: '6px', fontSize: '14px' }}
                title={skill}
              >
                {skill}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Software */}
      <div style={{ marginBottom: '30px' }}>
        <SectionHeader
          title="Софт"
          onAdd={() => updateSoftware([...data.software, 'Новая программа'])}
        />
        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSoftwareDragEnd}
          >
            <SortableContext items={softwareIds} strategy={verticalListSortingStrategy}>
              <ul className="list-none">
                {data.software.map((soft, i) => (
                  <SortableItem
                    key={i}
                    item={soft}
                    index={i}
                    prefix="software"
                    onChange={(value) => handleSoftwareChange(i, value)}
                    onDelete={() => updateSoftware(data.software.filter((_, j) => j !== i))}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul className="list-none">
            {data.software.map((soft, i) => (
              <li
                key={i}
                className="truncate"
                style={{ marginBottom: '6px', fontSize: '14px' }}
                title={soft}
              >
                {soft}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Languages */}
      <div style={{ marginBottom: '30px' }}>
        <SectionHeader
          title="Языки"
          onAdd={() => updateLanguages([...data.languages, { name: 'Язык', level: 'Уровень' }])}
        />
        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLanguageDragEnd}
          >
            <SortableContext items={langIds} strategy={verticalListSortingStrategy}>
              <ul className="list-none">
                {data.languages.map((lang, i) => (
                  <SortableLanguage
                    key={i}
                    lang={lang}
                    index={i}
                    onChangeName={(name) => handleLanguageChange(i, 'name', name)}
                    onChangeLevel={(level) => handleLanguageChange(i, 'level', level)}
                    onDelete={() => updateLanguages(data.languages.filter((_, j) => j !== i))}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul className="list-none">
            {data.languages.map((lang, i) => (
              <li
                key={i}
                className="truncate"
                style={{ marginBottom: '6px', fontSize: '14px' }}
                title={`${lang.name}: ${lang.level}`}
              >
                <strong>{lang.name}:</strong> {lang.level}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
