import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { SectionType } from '../types/resume'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: SectionType) => void
}

const sectionTypes: SectionType[] = ['text', 'career', 'projects']

export function AddSectionModal({ isOpen, onClose, onSelect }: Props) {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
      <div
        ref={modalRef}
        className="bg-white rounded border border-gray-200 shadow-lg p-4 w-80 max-w-[90vw]"
      >
        <div className="text-sm font-medium text-gray-700 mb-3">{t('sections.addSection')}</div>
        <div className="space-y-2">
          {sectionTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                onSelect(type)
                onClose()
              }}
              className="w-full text-left p-3 rounded border border-gray-200 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <div className="text-sm font-medium text-gray-700">{t(`sections.${type}`)}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t(`sections.${type}Desc`)}</div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
