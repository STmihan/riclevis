import { useEffect, useState, useCallback } from 'react'
import { Link } from 'lucide-react'

interface Position {
  top: number
  left: number
}

interface Props {
  containerRef: React.RefObject<HTMLElement | null>
  onFormat: (command: 'bold' | 'italic' | 'underline' | 'link') => void
}

export function FormatToolbar({ containerRef, onFormat }: Props) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !containerRef.current) {
      setVisible(false)
      return
    }

    // Check if selection is within our container
    const range = selection.getRangeAt(0)
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setVisible(false)
      return
    }

    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    // Position toolbar above the selection
    setPosition({
      top: rect.top - containerRect.top - 40,
      left: rect.left - containerRect.left + rect.width / 2 - 80, // Center the toolbar
    })
    setVisible(true)
  }, [containerRef])

  useEffect(() => {
    document.addEventListener('selectionchange', updatePosition)
    return () => {
      document.removeEventListener('selectionchange', updatePosition)
    }
  }, [updatePosition])

  const handleMouseDown = (
    e: React.MouseEvent,
    command: 'bold' | 'italic' | 'underline' | 'link'
  ) => {
    e.preventDefault() // Prevent losing selection
    onFormat(command)
  }

  if (!visible) return null

  return (
    <div
      className="absolute z-50 bg-gray-800 text-white rounded shadow-lg flex items-center px-1 py-1 print:hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        onMouseDown={(e) => handleMouseDown(e, 'bold')}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded font-bold"
        title="Жирный (Ctrl+B)"
      >
        B
      </button>
      <button
        onMouseDown={(e) => handleMouseDown(e, 'italic')}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded italic"
        title="Курсив (Ctrl+I)"
      >
        I
      </button>
      <button
        onMouseDown={(e) => handleMouseDown(e, 'underline')}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded underline"
        title="Подчёркивание (Ctrl+U)"
      >
        U
      </button>
      <div className="w-px h-5 bg-gray-600 mx-1" />
      <button
        onMouseDown={(e) => handleMouseDown(e, 'link')}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
        title="Ссылка (Ctrl+K)"
      >
        <Link size={16} />
      </button>
    </div>
  )
}
