import { create } from 'zustand'
import { temporal } from 'zundo'
import type { Resume, Section, Contact, Language, LocalizedString } from '../types/resume'

const GH_URL = import.meta.env.VITE_GH_URL as string | undefined
const IS_PRODUCTION = !!GH_URL
const STORAGE_KEY = 'resume-data'

interface ResumeState {
  data: Resume | null
  isEditMode: boolean
  isLoading: boolean
  ghUrl: string | null

  init: () => Promise<void>
  setEditMode: (mode: boolean) => void
  updateName: (name: LocalizedString) => void
  updateSubtitle: (subtitle: LocalizedString) => void
  updateSection: (id: string, updates: Partial<Section>) => void
  addSection: (section: Section, afterId?: string) => void
  removeSection: (id: string) => void
  reorderSections: (fromIndex: number, toIndex: number) => void
  moveItem: (fromSectionId: string, toSectionId: string, fromIndex: number, toIndex: number) => void
  updateSkills: (skills: LocalizedString[]) => void
  updateSoftware: (software: LocalizedString[]) => void
  updateContacts: (contacts: Contact[]) => void
  updateLanguages: (languages: Language[]) => void
  updatePortfolio: (url: string, label: string) => void
  resetToDefault: () => void
  importJSON: (json: string) => boolean
}

const loadInitialData = async (): Promise<Resume> => {
  if (!IS_PRODUCTION) {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // Invalid JSON, use default
      }
    }
  }
  const response = await fetch('/resume.json')
  return response.json()
}

export const useResumeStore = create<ResumeState>()(
  temporal(
    (set) => ({
      data: null,
      isEditMode: false,
      isLoading: true,
      ghUrl: GH_URL || null,

      init: async () => {
        const data = await loadInitialData()
        const params = new URLSearchParams(window.location.search)
        set({ data, isEditMode: params.has('edit'), isLoading: false })
        useResumeStore.temporal.getState().clear()
      },

      setEditMode: (mode) => {
        set({ isEditMode: mode })
        const url = new URL(window.location.href)
        if (mode) {
          url.searchParams.set('edit', '')
        } else {
          url.searchParams.delete('edit')
        }
        window.history.replaceState({}, '', url.toString())
      },

      updateName: (name) => {
        set((state) => ({
          data: state.data ? { ...state.data, name } : null,
        }))
      },

      updateSubtitle: (subtitle) => {
        set((state) => ({
          data: state.data ? { ...state.data, subtitle } : null,
        }))
      },

      updateSection: (id, updates) => {
        set((state) => ({
          data: state.data
            ? {
                ...state.data,
                sections: state.data.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
              }
            : null,
        }))
      },

      addSection: (section, afterId) => {
        set((state) => {
          if (!state.data) return state
          if (!afterId) {
            return {
              data: {
                ...state.data,
                sections: [...state.data.sections, section],
              },
            }
          }
          const index = state.data.sections.findIndex((s) => s.id === afterId)
          const newSections = [...state.data.sections]
          newSections.splice(index + 1, 0, section)
          return { data: { ...state.data, sections: newSections } }
        })
      },

      removeSection: (id) => {
        set((state) => ({
          data: state.data
            ? {
                ...state.data,
                sections: state.data.sections.filter((s) => s.id !== id),
              }
            : null,
        }))
      },

      reorderSections: (fromIndex, toIndex) => {
        set((state) => {
          if (!state.data) return state
          const newSections = [...state.data.sections]
          const [removed] = newSections.splice(fromIndex, 1)
          newSections.splice(toIndex, 0, removed)
          return { data: { ...state.data, sections: newSections } }
        })
      },

      moveItem: (fromSectionId, toSectionId, fromIndex, toIndex) => {
        set((state) => {
          if (!state.data) return state
          const newSections = state.data.sections.map((s) => ({
            ...s,
            content: { ...s.content },
          }))
          const fromSection = newSections.find((s) => s.id === fromSectionId)
          const toSection = newSections.find((s) => s.id === toSectionId)

          if (!fromSection || !toSection) return state
          if (!('items' in fromSection.content) || !('items' in toSection.content)) return state

          const fromItems = [...(fromSection.content as { items: unknown[] }).items]
          const toItems =
            fromSectionId === toSectionId
              ? fromItems
              : [...(toSection.content as { items: unknown[] }).items]

          const [removed] = fromItems.splice(fromIndex, 1)

          if (fromSectionId === toSectionId) {
            fromItems.splice(toIndex, 0, removed)
            ;(fromSection.content as { items: unknown[] }).items = fromItems
          } else {
            toItems.splice(toIndex, 0, removed)
            ;(fromSection.content as { items: unknown[] }).items = fromItems
            ;(toSection.content as { items: unknown[] }).items = toItems
          }

          return { data: { ...state.data, sections: newSections } }
        })
      },

      updateSkills: (skills) => {
        set((state) => ({
          data: state.data
            ? {
                ...state.data,
                sidebar: { ...state.data.sidebar, skills },
              }
            : null,
        }))
      },

      updateSoftware: (software) => {
        set((state) => ({
          data: state.data
            ? {
                ...state.data,
                sidebar: { ...state.data.sidebar, software },
              }
            : null,
        }))
      },

      updateContacts: (contacts) => {
        set((state) => ({
          data: state.data
            ? {
                ...state.data,
                sidebar: { ...state.data.sidebar, contacts },
              }
            : null,
        }))
      },

      updateLanguages: (languages) => {
        set((state) => ({
          data: state.data
            ? {
                ...state.data,
                sidebar: { ...state.data.sidebar, languages },
              }
            : null,
        }))
      },

      updatePortfolio: (portfolioUrl, portfolioLabel) => {
        set((state) => ({
          data: state.data
            ? {
                ...state.data,
                sidebar: { ...state.data.sidebar, portfolioUrl, portfolioLabel },
              }
            : null,
        }))
      },

      resetToDefault: async () => {
        localStorage.removeItem(STORAGE_KEY)
        const response = await fetch('/resume.json')
        const defaultData = await response.json()
        set({ data: defaultData as Resume })
      },

      importJSON: (json) => {
        try {
          const parsed = JSON.parse(json)
          set({ data: parsed })
          return true
        } catch {
          return false
        }
      },
    }),
    { limit: 50, partialize: (s) => ({ data: s.data }) }
  )
)

if (!IS_PRODUCTION) {
  let timeout: ReturnType<typeof setTimeout>
  useResumeStore.subscribe((state) => {
    if (!state.data) return
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data))
    }, 500)
  })
}
