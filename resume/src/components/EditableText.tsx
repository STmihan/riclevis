import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useResumeContext } from '../context/ResumeContext'

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
  multiline?: boolean
  placeholder?: string
}

export function EditableText({
  value,
  onChange,
  className = '',
  multiline = false,
  placeholder = 'Click to edit...',
}: Props) {
  const { isEditMode } = useResumeContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    onChange(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (!isEditMode) {
    return <span className={className}>{value}</span>
  }

  if (isEditing) {
    const inputClassName = `${className} bg-blue-50 border border-blue-300 rounded px-1 outline-none focus:ring-2 focus:ring-blue-400`

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`${inputClassName} resize-none w-full min-h-[60px]`}
          rows={3}
        />
      )
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer hover:bg-yellow-100 hover:outline hover:outline-2 hover:outline-yellow-300 rounded transition-colors`}
      title="Click to edit"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </span>
  )
}
