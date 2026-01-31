import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const GH_URL = import.meta.env.VITE_GH_URL as string | undefined
const IS_PRODUCTION = !!GH_URL

interface UIState {
  displayLang: string
  setDisplayLang: (lang: string) => void
}

export const useUIStore = IS_PRODUCTION
  ? create<UIState>()((set) => ({
      displayLang: 'en',
      setDisplayLang: (lang) => set({ displayLang: lang }),
    }))
  : create<UIState>()(
      persist(
        (set) => ({
          displayLang: 'en',
          setDisplayLang: (lang) => set({ displayLang: lang }),
        }),
        { name: 'resume-ui' }
      )
    )
