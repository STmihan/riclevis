import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PopupProvider } from './context/PopupContext'
import { Resume } from './components/Resume'
import { EditorToolbar } from './components/EditorToolbar'
import { ViewModeControls } from './components/ViewModeControls'
import { useResumeStore } from './store/resumeStore'
import { useUndoRedo } from './hooks/useUndoRedo'

function ResumeApp() {
  const { t } = useTranslation()
  const { data, isEditMode, isLoading, init } = useResumeStore()
  useUndoRedo()

  useEffect(() => {
    init()
  }, [init])

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex justify-center ${isEditMode ? 'pt-10' : ''}`}>
      <EditorToolbar />
      <ViewModeControls />
      <Resume data={data} />
    </div>
  )
}

function App() {
  return (
    <PopupProvider>
      <ResumeApp />
    </PopupProvider>
  )
}

export default App
