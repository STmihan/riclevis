/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface LinkPopupData {
  type: 'link'
  initialUrl: string
  initialText?: string
  onSubmit: (url: string, text: string) => void
  onRemove?: () => void
  onClose?: () => void
}

interface ConfirmPopupData {
  type: 'confirm'
  title: string
  message: string
  onConfirm: () => void
}

interface AlertPopupData {
  type: 'alert'
  title: string
  message: string
  onClose?: () => void
}

interface InputPopupData {
  type: 'input'
  title: string
  placeholder?: string
  initialValue?: string
  onSubmit: (value: string) => void
}

type PopupData = LinkPopupData | ConfirmPopupData | AlertPopupData | InputPopupData

interface PopupContextType {
  openLinkPopup: (data: Omit<LinkPopupData, 'type'>) => void
  openConfirmPopup: (data: Omit<ConfirmPopupData, 'type'>) => void
  openAlertPopup: (data: Omit<AlertPopupData, 'type'>) => void
  openInputPopup: (data: Omit<InputPopupData, 'type'>) => void
  closePopup: () => void
}

const PopupContext = createContext<PopupContextType | null>(null)

export function usePopup() {
  const context = useContext(PopupContext)
  if (!context) {
    throw new Error('usePopup must be used within PopupProvider')
  }
  return context
}

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupData | null>(null)

  const openLinkPopup = useCallback((data: Omit<LinkPopupData, 'type'>) => {
    setPopup({ type: 'link', ...data })
  }, [])

  const openConfirmPopup = useCallback((data: Omit<ConfirmPopupData, 'type'>) => {
    setPopup({ type: 'confirm', ...data })
  }, [])

  const openAlertPopup = useCallback((data: Omit<AlertPopupData, 'type'>) => {
    setPopup({ type: 'alert', ...data })
  }, [])

  const openInputPopup = useCallback((data: Omit<InputPopupData, 'type'>) => {
    setPopup({ type: 'input', ...data })
  }, [])

  const closePopup = useCallback(() => {
    setPopup(null)
  }, [])

  return (
    <PopupContext.Provider value={{ openLinkPopup, openConfirmPopup, openAlertPopup, openInputPopup, closePopup }}>
      {children}
      {popup && <PopupRenderer popup={popup} onClose={closePopup} />}
    </PopupContext.Provider>
  )
}

function PopupRenderer({ popup, onClose }: { popup: PopupData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] print:hidden">
      {popup.type === 'link' && <LinkPopupContent popup={popup} onClose={onClose} />}
      {popup.type === 'confirm' && <ConfirmPopupContent popup={popup} onClose={onClose} />}
      {popup.type === 'alert' && <AlertPopupContent popup={popup} onClose={onClose} />}
      {popup.type === 'input' && <InputPopupContent popup={popup} onClose={onClose} />}
    </div>
  )
}

function LinkPopupContent({ popup, onClose }: { popup: LinkPopupData; onClose: () => void }) {
  const { t } = useTranslation()
  const [url, setUrl] = useState(popup.initialUrl)
  const [text, setText] = useState(popup.initialText || '')

  const handleClose = () => {
    popup.onClose?.()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    popup.onSubmit(url.trim(), text.trim() || 'Link')
    handleClose()
  }

  const handleRemove = () => {
    popup.onRemove?.()
    handleClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }

  const hasExistingLink = popup.initialUrl.length > 0

  return (
    <div
      className="bg-white rounded border border-gray-200 shadow-lg w-[320px] max-w-[90vw]"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      <div className="p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          {hasExistingLink ? t('popup.editLink') : t('popup.addLink')}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('popup.linkText')}
            autoFocus
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-500 mb-2"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="flex-1 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              {t('common.apply')}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>

          {hasExistingLink && popup.onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="w-full mt-2 py-2 text-red-600 text-sm hover:bg-red-50 rounded transition-colors"
            >
              {t('popup.removeLink')}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

function ConfirmPopupContent({ popup, onClose }: { popup: ConfirmPopupData; onClose: () => void }) {
  const { t } = useTranslation()

  const handleConfirm = () => {
    popup.onConfirm()
    onClose()
  }

  return (
    <div
      className="bg-white rounded border border-gray-200 shadow-lg w-[320px] max-w-[90vw]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">{popup.title}</div>
        <p className="text-sm text-gray-500 mb-4">{popup.message}</p>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            {t('common.confirm')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AlertPopupContent({ popup, onClose }: { popup: AlertPopupData; onClose: () => void }) {
  const handleClose = () => {
    popup.onClose?.()
    onClose()
  }

  return (
    <div
      className="bg-white rounded border border-gray-200 shadow-lg w-[320px] max-w-[90vw]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">{popup.title}</div>
        <p className="text-sm text-gray-500 mb-4">{popup.message}</p>

        <button
          onClick={handleClose}
          className="w-full py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  )
}

function InputPopupContent({ popup, onClose }: { popup: InputPopupData; onClose: () => void }) {
  const { t } = useTranslation()
  const [value, setValue] = useState(popup.initialValue || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    popup.onSubmit(value.trim())
    onClose()
  }

  return (
    <div
      className="bg-white rounded border border-gray-200 shadow-lg w-[320px] max-w-[90vw]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">{popup.title}</div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={popup.placeholder}
            autoFocus
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="flex-1 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
