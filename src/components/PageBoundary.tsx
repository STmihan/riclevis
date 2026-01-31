import { useEffect, useState, useRef } from 'react'

interface Props {
  containerRef: React.RefObject<HTMLElement | null>
  contentRef?: React.RefObject<HTMLElement | null>
  showBoundaries?: boolean
}

const A4_HEIGHT_MM = 297

export function PageBoundary({ containerRef, contentRef, showBoundaries = false }: Props) {
  const [pageCount, setPageCount] = useState(1)
  const measureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !measureRef.current) return

    const updatePageCount = () => {
      if (containerRef.current && measureRef.current) {
        const a4HeightPx = measureRef.current.offsetHeight
        if (a4HeightPx === 0) return
        const measureTarget = contentRef?.current || containerRef.current
        const contentHeight = measureTarget.scrollHeight
        const pages = Math.max(1, Math.ceil(contentHeight / a4HeightPx))
        setPageCount(pages)
        containerRef.current.style.minHeight = `${pages * A4_HEIGHT_MM}mm`
      }
    }

    updatePageCount()

    const observer = new ResizeObserver(updatePageCount)
    observer.observe(containerRef.current)
    if (contentRef?.current) {
      observer.observe(contentRef.current)
    }

    return () => observer.disconnect()
  }, [containerRef, contentRef])

  const boundaries = Array.from({ length: pageCount }, (_, i) => i + 1)

  return (
    <>
      <div
        ref={measureRef}
        className="absolute pointer-events-none"
        style={{ height: `${A4_HEIGHT_MM}mm`, width: 0, visibility: 'hidden' }}
      />
      {showBoundaries &&
        boundaries.map((pageNum) => (
          <div
            key={pageNum}
            className="absolute left-0 right-0 pointer-events-none print:hidden"
            style={{ top: `${pageNum * A4_HEIGHT_MM}mm` }}
          >
            <div
              className="h-px"
              style={{
                background:
                  'repeating-linear-gradient(90deg, #f87171 0px, #f87171 4px, transparent 4px, transparent 8px)',
              }}
            />
            <span className="absolute right-2 -top-5 text-xs text-red-400 bg-white px-1 rounded">
              Страница {pageNum}
            </span>
          </div>
        ))}
    </>
  )
}
