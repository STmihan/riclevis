import { useEffect, useState, useRef } from 'react'

interface Props {
  containerRef: React.RefObject<HTMLElement | null>
  contentRef?: React.RefObject<HTMLElement | null>
  showBoundaries?: boolean
}

// A4 page height in mm
const A4_HEIGHT_MM = 297

export function PageBoundary({ containerRef, contentRef, showBoundaries = false }: Props) {
  const [pageCount, setPageCount] = useState(1)
  const measureRef = useRef<HTMLDivElement>(null)

  // Track content height changes and calculate pages
  useEffect(() => {
    if (!containerRef.current || !measureRef.current) return

    const updatePageCount = () => {
      if (containerRef.current && measureRef.current) {
        // Get the actual pixel height of 297mm by measuring our reference element
        const a4HeightPx = measureRef.current.offsetHeight

        // Use contentRef if provided (to exclude AddSectionButton), otherwise use container
        const measureTarget = contentRef?.current || containerRef.current
        const contentHeight = measureTarget.scrollHeight

        // Calculate how many pages we need
        const pages = Math.max(1, Math.ceil(contentHeight / a4HeightPx))
        setPageCount(pages)

        // Set container minHeight to full pages
        containerRef.current.style.minHeight = `${pages * A4_HEIGHT_MM}mm`
      }
    }

    updatePageCount()

    // Observe both container and content (if provided)
    const observer = new ResizeObserver(updatePageCount)
    observer.observe(containerRef.current)
    if (contentRef?.current) {
      observer.observe(contentRef.current)
    }

    return () => observer.disconnect()
  }, [containerRef, contentRef])

  // Generate boundary lines at each page break (only shown in edit mode)
  const boundaries = Array.from({ length: pageCount }, (_, i) => i + 1)

  return (
    <>
      {/* Hidden reference element to measure exact 297mm in pixels */}
      <div
        ref={measureRef}
        className="absolute pointer-events-none"
        style={{ height: `${A4_HEIGHT_MM}mm`, width: 0, visibility: 'hidden' }}
      />
      {/* Visual page boundaries - only in edit mode */}
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
