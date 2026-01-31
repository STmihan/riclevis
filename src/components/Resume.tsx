import { useRef, useState, useEffect } from 'react'
import type { Resume as ResumeType } from '../types/resume'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { PageBoundary } from './PageBoundary'
import { ItemDndProvider } from './ItemDndContext'
import { useResumeStore } from '../store/resumeStore'

const RESUME_WIDTH_PX = 794 // 210mm at 96dpi
const MOBILE_BREAKPOINT = 768

interface Props {
  data: ResumeType
}

export function Resume({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isEditMode = useResumeStore((s) => s.isEditMode)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number | undefined>(undefined)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateLayout = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)

      if (mobile) {
        setScale(1)
        setHeight(undefined)
      } else {
        const padding = window.innerWidth / 6
        const availableWidth = window.innerWidth - padding * 2
        const newScale = availableWidth < RESUME_WIDTH_PX ? availableWidth / RESUME_WIDTH_PX : 1
        setScale(newScale)

        if (containerRef.current && newScale < 1) {
          setHeight(containerRef.current.offsetHeight * newScale)
        } else {
          setHeight(undefined)
        }
      }
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  useEffect(() => {
    if (!isMobile && containerRef.current && scale < 1) {
      const observer = new ResizeObserver(() => {
        if (containerRef.current) {
          setHeight(containerRef.current.offsetHeight * scale)
        }
      })
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [scale, isMobile])

  return (
    <ItemDndProvider>
      {isMobile && (
        <div className="resume-mobile bg-white min-h-screen no-print">
          <MainContent
            name={data.name}
            subtitle={data.subtitle}
            sections={data.sections}
            isMobile
            renderPart="header"
          />
          <Sidebar data={data.sidebar} isMobile />
          <MainContent
            name={data.name}
            subtitle={data.subtitle}
            sections={data.sections}
            contentRef={contentRef}
            isMobile
            renderPart="sections"
          />
        </div>
      )}

      <div
        ref={wrapperRef}
        className="desktop-layout print:!h-auto print:!w-auto"
        style={{
          height: height ? `${height}px` : 'auto',
          width: scale < 1 ? `${RESUME_WIDTH_PX * scale}px` : 'auto',
          margin: '0 auto',
          display: isMobile ? 'none' : 'block',
        }}
      >
        <div
          ref={containerRef}
          className="resume-container bg-white relative print:!transform-none"
          style={{
            width: '210mm',
            minHeight: '297mm',
            display: 'grid',
            gridTemplateColumns: '70mm 1fr',
            boxShadow: scale < 1 ? 'none' : '0 0 15px rgba(0,0,0,0.1)',
            transform: scale < 1 ? `scale(${scale})` : 'none',
            transformOrigin: 'top left',
          }}
        >
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
      </div>
    </ItemDndProvider>
  )
}
