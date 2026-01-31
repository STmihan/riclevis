import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useResumeStore } from '../store/resumeStore'
import { usePopup } from '../context/PopupContext'
import { sanitizeHtml } from '../utils/sanitizeHtml'
import { FormatToolbar } from './FormatToolbar'

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function RichText({ value, onChange, className = '', placeholder }: Props) {
  const { t } = useTranslation()
  const isEditMode = useResumeStore((s) => s.isEditMode)
  const { openLinkPopup } = usePopup()
  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const savedSelectionRef = useRef<Range | null>(null)
  const isOpeningPopupRef = useRef(false)

  const defaultPlaceholder = placeholder || t('tooltips.clickToEdit')

  useEffect(() => {
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = sanitizeHtml(value)
    }
  }, [value, isEditing])

  const handleSave = useCallback(() => {
    if (isOpeningPopupRef.current) return

    if (editorRef.current) {
      const html = sanitizeHtml(editorRef.current.innerHTML)
      onChange(html)
    }
    setIsEditing(false)
  }, [onChange])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          document.execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          document.execCommand('italic')
          break
        case 'u':
          e.preventDefault()
          document.execCommand('underline')
          break
        case 'k':
          e.preventDefault()
          handleLinkCommand()
          break
      }
    }

    if (e.key === 'Escape') {
      if (editorRef.current) {
        editorRef.current.innerHTML = sanitizeHtml(value)
      }
      setIsEditing(false)
    }
  }

  const handleFormat = (command: 'bold' | 'italic' | 'underline' | 'link') => {
    if (command === 'link') {
      handleLinkCommand()
    } else {
      document.execCommand(command)
    }
  }

  const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange()
    }
  }

  const restoreSelection = () => {
    if (savedSelectionRef.current && editorRef.current) {
      editorRef.current.focus()
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedSelectionRef.current)
      }
    }
  }

  const getParentLink = (node: Node | null): HTMLAnchorElement | null => {
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'A') {
        return node as HTMLAnchorElement
      }
      node = node.parentNode
    }
    return null
  }

  const handleLinkCommand = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    saveSelection()
    isOpeningPopupRef.current = true

    const existingLink = getParentLink(selection.anchorNode)
    const currentUrl = existingLink?.getAttribute('href') || ''

    openLinkPopup({
      initialUrl: currentUrl,
      initialText: selection.toString(),

      onSubmit: (url, _text) => {
        restoreSelection()
        if (url) {
          document.execCommand('createLink', false, url)
        }
        isOpeningPopupRef.current = false
        editorRef.current?.focus()
      },
      onRemove: currentUrl
        ? () => {
            restoreSelection()
            document.execCommand('unlink')
            isOpeningPopupRef.current = false
            editorRef.current?.focus()
          }
        : undefined,
      onClose: () => {
        isOpeningPopupRef.current = false
        editorRef.current?.focus()
      },
    })
  }

  const handlePaste = (e: ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain')

    const urlPattern = /^https?:\/\/\S+$/i
    if (urlPattern.test(text.trim())) {
      e.preventDefault()
      const url = text.trim()

      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) {
        document.execCommand('createLink', false, url)
      } else {
        document.execCommand('insertHTML', false, `<a href="${url}">${url}</a>`)
      }
    }
  }

  if (!isEditMode) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} />
  }

  if (!isEditing) {
    return (
      <span
        onClick={() => setIsEditing(true)}
        className={`${className} cursor-pointer hover:bg-yellow-100 hover:outline hover:outline-2 hover:outline-yellow-300 rounded transition-colors`}
        title={t('tooltips.clickToEdit')}
        dangerouslySetInnerHTML={{
          __html: value
            ? sanitizeHtml(value)
            : `<span class="text-gray-400 italic">${defaultPlaceholder}</span>`,
        }}
      />
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <FormatToolbar containerRef={containerRef} onFormat={handleFormat} />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={`${className} bg-blue-50 border border-blue-300 rounded px-1 outline-none focus:ring-2 focus:ring-blue-400 min-h-[1.5em]`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
      />
    </div>
  )
}
