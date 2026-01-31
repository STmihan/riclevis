import { useRef } from 'react'
import { useResumeContext } from '../context/ResumeContext'

export function EditorToolbar() {
  const { isEditMode, exportJSON, importJSON, resetToDefault } = useResumeContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isEditMode) return null

  const handlePrint = () => {
    // Open clean version in new tab
    const cleanUrl = window.location.origin + window.location.pathname
    window.open(cleanUrl, '_blank')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (importJSON(content)) {
        alert('Данные импортированы!')
      } else {
        alert('Ошибка импорта: неверный JSON')
      }
    }
    reader.readAsText(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReset = () => {
    if (confirm('Сбросить все данные? Это действие нельзя отменить.')) {
      resetToDefault()
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-4 z-50 no-print">
      <div className="flex items-center gap-2">
        <span className="text-gray-700 text-sm font-medium">Редактирование</span>
        <span className="text-gray-400 text-xs">Автосохранение</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 transition-colors"
        >
          Печать
        </button>

        <button
          onClick={exportJSON}
          className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50 transition-colors"
        >
          Экспорт
        </button>

        <label className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50 cursor-pointer transition-colors">
          Импорт
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-red-600 text-xs rounded hover:bg-red-50 transition-colors"
        >
          Сброс
        </button>
      </div>
    </div>
  )
}
