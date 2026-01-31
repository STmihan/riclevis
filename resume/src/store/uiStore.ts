import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  displayLang: string
  setDisplayLang: (lang: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      displayLang: 'ru',
      setDisplayLang: (lang) => set({ displayLang: lang }),
    }),
    { name: 'resume-ui' }
  )
)
