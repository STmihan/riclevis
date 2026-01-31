import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useResumeStore } from '../store/resumeStore'
import { useUIStore } from '../store/uiStore'
import { useUndoRedo } from '../hooks/useUndoRedo'
import { usePopup } from '../context/PopupContext'

const GH_URL = import.meta.env.VITE_GH_URL as string | undefined
const GH_BRANCH = (import.meta.env.VITE_GH_BRANCH as string) || 'main'

export function EditorToolbar() {
  const { t } = useTranslation()
  const { isEditMode, data, importJSON, resetToDefault } = useResumeStore()
  const { displayLang, setDisplayLang } = useUIStore()
  const { canUndo, canRedo, undo, redo } = useUndoRedo()
  const { openAlertPopup } = usePopup()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isEditMode) return null

  const handlePrint = () => {
    const cleanUrl = window.location.origin + window.location.pathname
    window.open(cleanUrl, '_blank')
  }

  const handleExport = async () => {
    const json = JSON.stringify(data, null, 2)
    await navigator.clipboard.writeText(json)

    if (GH_URL) {
      const editUrl = `${GH_URL}/edit/${GH_BRANCH}/public/resume.json`
      openAlertPopup({
        title: t('editor.export'),
        message: t('alerts.exportCopied'),
        onClose: () => {
          window.open(editUrl, '_blank')
        },
      })
    } else {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (importJSON(content)) {
        alert(t('alerts.importSuccess'))
      } else {
        alert(t('alerts.importError'))
      }
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReset = () => {
    if (confirm(t('alerts.resetConfirm'))) {
      resetToDefault()
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-4 z-50 no-print">
      <div className="flex items-center gap-2">
        <span className="text-gray-700 text-sm font-medium">{t('editor.editing')}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-xs">{t('editor.displayLang')}:</span>
          <select
            value={displayLang}
            onChange={(e) => setDisplayLang(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:border-gray-500"
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
        </div>

        <div className="w-px h-5 bg-gray-200" />

        <button
          onClick={() => undo()}
          disabled={!canUndo}
          className="px-2 py-1.5 text-gray-600 text-xs rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Ctrl+Z"
        >
          {t('editor.undo')}
        </button>
        <button
          onClick={() => redo()}
          disabled={!canRedo}
          className="px-2 py-1.5 text-gray-600 text-xs rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Ctrl+Y"
        >
          {t('editor.redo')}
        </button>

        <div className="w-px h-5 bg-gray-200" />

        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 transition-colors"
        >
          {t('editor.print')}
        </button>

        <button
          onClick={handleExport}
          className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50 transition-colors"
        >
          {t('editor.export')}
        </button>

        <label className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50 cursor-pointer transition-colors">
          {t('editor.import')}
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
          {t('editor.reset')}
        </button>
      </div>
    </div>
  )
}
