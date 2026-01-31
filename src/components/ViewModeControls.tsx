import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useResumeStore } from '../store/resumeStore'
import { useUIStore } from '../store/uiStore'

export function ViewModeControls() {
  const { t } = useTranslation()
  const isEditMode = useResumeStore((s) => s.isEditMode)
  const { displayLang, setDisplayLang } = useUIStore()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < 50 || currentScrollY < lastScrollY)
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isEditMode) return null

  const handleEditClick = () => {
    window.location.href = '?edit'
  }

  const toggleLang = () => {
    setDisplayLang(displayLang === 'ru' ? 'en' : 'ru')
  }

  return (
    <div
      className={`fixed top-4 right-4 flex items-center gap-2 z-50 print:hidden transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <button
        onClick={toggleLang}
        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-sm flex items-center justify-center text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        title={t('common.switchLang')}
      >
        {displayLang.toUpperCase()}
      </button>

      <button
        onClick={handleEditClick}
        className="hidden md:flex w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-sm items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
        title={t('common.edit')}
      >
        <Pencil size={16} />
      </button>
    </div>
  )
}
