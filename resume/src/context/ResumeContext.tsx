/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'
import { useResume } from '../hooks/useResume'
import { useEditMode } from '../hooks/useEditMode'

type ResumeContextType = ReturnType<typeof useResume> & {
  isEditMode: boolean
}

const ResumeContext = createContext<ResumeContextType | null>(null)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const resume = useResume()
  const isEditMode = useEditMode()

  return (
    <ResumeContext.Provider value={{ ...resume, isEditMode }}>{children}</ResumeContext.Provider>
  )
}

export function useResumeContext() {
  const context = useContext(ResumeContext)
  if (!context) {
    throw new Error('useResumeContext must be used within ResumeProvider')
  }
  return context
}
