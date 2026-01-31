import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Section, TextContent, CareerContent, ProjectsContent } from '../types/resume'
import { isTextContent, isCareerContent, isProjectsContent } from '../types/resume'
import { TextSection, CareerSection, ProjectsSection } from './sections'
import { EditableText } from './EditableText'
import { SectionWrapper } from './SectionWrapper'
import { AddSectionButton } from './AddSectionButton'
import { useResumeContext } from '../context/ResumeContext'

interface Props {
  name: string
  subtitle: string
  sections: Section[]
  contentRef?: React.RefObject<HTMLDivElement | null>
}

export function MainContent({ name, subtitle, sections, contentRef }: Props) {
  const { updateName, updateSubtitle, updateSection, reorderSections, isEditMode } =
    useResumeContext()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)
      reorderSections(oldIndex, newIndex)
    }
  }

  const handleAddItem = (section: Section) => {
    if (isCareerContent(section.content)) {
      const content = section.content as CareerContent
      const newItem = { title: 'Новый проект', description: 'Описание проекта' }
      updateSection(section.id, { content: { ...content, items: [...content.items, newItem] } })
    } else if (isProjectsContent(section.content)) {
      const content = section.content as ProjectsContent
      const newItem = { name: 'Новый проект', duration: '3 дня', description: 'Описание проекта' }
      updateSection(section.id, { content: { items: [...content.items, newItem] } })
    }
  }

  const renderSection = (section: Section) => {
    let content = null
    let onAddItem: (() => void) | undefined

    if (isTextContent(section.content)) {
      content = (
        <TextSection
          id={section.id}
          title={section.title}
          content={section.content as TextContent}
        />
      )
    } else if (isCareerContent(section.content)) {
      content = (
        <CareerSection
          id={section.id}
          title={section.title}
          content={section.content as CareerContent}
        />
      )
      onAddItem = () => handleAddItem(section)
    } else if (isProjectsContent(section.content)) {
      content = (
        <ProjectsSection
          id={section.id}
          title={section.title}
          content={section.content as ProjectsContent}
        />
      )
      onAddItem = () => handleAddItem(section)
    }

    if (!content) return null

    return (
      <SectionWrapper key={section.id} id={section.id} onAddItem={onAddItem}>
        {content}
      </SectionWrapper>
    )
  }

  const sectionIds = sections.map((s) => s.id)

  return (
    <main style={{ padding: '40px' }} className="flex-1">
      {/* Content wrapper for measuring height (excludes AddSectionButton) */}
      <div ref={contentRef}>
        <header style={{ marginBottom: '30px' }}>
          <h1
            style={{
              fontSize: '32px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '5px',
              lineHeight: 1.1,
              fontWeight: 'bold',
            }}
          >
            <EditableText
              value={name}
              onChange={updateName}
              multiline
              className="whitespace-pre-line"
            />
          </h1>
          <div style={{ fontSize: '18px', color: '#555', fontWeight: 300 }}>
            <EditableText value={subtitle} onChange={updateSubtitle} />
          </div>
        </header>

        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              {sections.map((section) => renderSection(section))}
            </SortableContext>
          </DndContext>
        ) : (
          sections.map((section) => renderSection(section))
        )}
      </div>
      <AddSectionButton />
    </main>
  )
}
