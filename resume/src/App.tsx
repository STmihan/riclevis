import { ResumeProvider, useResumeContext } from './context/ResumeContext'
import { PopupProvider } from './context/PopupContext'
import { Resume } from './components/Resume'
import { EditorToolbar } from './components/EditorToolbar'

function ResumeApp() {
  const { data, isEditMode } = useResumeContext()

  return (
    <div className={`min-h-screen flex justify-center ${isEditMode ? 'pt-10' : ''}`}>
      <EditorToolbar />
      <Resume data={data} />
    </div>
  )
}

function App() {
  return (
    <PopupProvider>
      <ResumeProvider>
        <ResumeApp />
      </ResumeProvider>
    </PopupProvider>
  )
}

export default App
