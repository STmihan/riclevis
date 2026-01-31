import { useRef } from 'react'
import type { Resume as ResumeType } from '../types/resume'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { PageBoundary } from './PageBoundary'
import { ItemDndProvider } from './ItemDndContext'
import { useResumeContext } from '../context/ResumeContext'

interface Props {
  data: ResumeType
}

export function Resume({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { isEditMode } = useResumeContext()

  return (
    <ItemDndProvider>
      <div
        ref={containerRef}
        className="resume-container bg-white relative"
        style={{
          width: '210mm',
          minHeight: '297mm',
          display: 'grid',
          gridTemplateColumns: '70mm 1fr',
          boxShadow: '0 0 15px rgba(0,0,0,0.1)',
        }}
      >
        {/* Dynamic page height management and boundary lines */}
        <PageBoundary
          containerRef={containerRef}
          contentRef={contentRef}
          showBoundaries={isEditMode}
        />

        <Sidebar data={data.sidebar} />
        <MainContent
          name={data.name}
          subtitle={data.subtitle}
          sections={data.sections}
          contentRef={contentRef}
        />
      </div>
    </ItemDndProvider>
  )
}
