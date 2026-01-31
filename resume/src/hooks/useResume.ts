import { useState, useCallback, useEffect } from 'react'
import type { Resume, Section, Contact, Language } from '../types/resume'
import defaultData from '../data/resume.json'

const STORAGE_KEY = 'resume-data'

export function useResume() {
  const [data, setData] = useState<Resume>(() => {
    // Try to load from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // Invalid JSON, use default
      }
    }
    return defaultData as Resume
  })

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  // Update name
  const updateName = useCallback((name: string) => {
    setData((prev) => ({ ...prev, name }))
  }, [])

  // Update subtitle
  const updateSubtitle = useCallback((subtitle: string) => {
    setData((prev) => ({ ...prev, subtitle }))
  }, [])

  // Update section
  const updateSection = useCallback((id: string, updates: Partial<Section>) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }))
  }, [])

  // Add section
  const addSection = useCallback((section: Section, afterId?: string) => {
    setData((prev) => {
      if (!afterId) {
        return { ...prev, sections: [...prev.sections, section] }
      }
      const index = prev.sections.findIndex((s) => s.id === afterId)
      const newSections = [...prev.sections]
      newSections.splice(index + 1, 0, section)
      return { ...prev, sections: newSections }
    })
  }, [])

  // Remove section
  const removeSection = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }))
  }, [])

  // Reorder sections
  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setData((prev) => {
      const newSections = [...prev.sections]
      const [removed] = newSections.splice(fromIndex, 1)
      newSections.splice(toIndex, 0, removed)
      return { ...prev, sections: newSections }
    })
  }, [])

  // Move item between sections (for projects and career items)
  const moveItem = useCallback(
    (fromSectionId: string, toSectionId: string, fromIndex: number, toIndex: number) => {
      setData((prev) => {
        const newSections = prev.sections.map((s) => ({ ...s, content: { ...s.content } }))
        const fromSection = newSections.find((s) => s.id === fromSectionId)
        const toSection = newSections.find((s) => s.id === toSectionId)

        if (!fromSection || !toSection) return prev
        if (!('items' in fromSection.content) || !('items' in toSection.content)) return prev

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

        return { ...prev, sections: newSections }
      })
    },
    []
  )

  // Sidebar updates
  const updateSkills = useCallback((skills: string[]) => {
    setData((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, skills },
    }))
  }, [])

  const updateSoftware = useCallback((software: string[]) => {
    setData((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, software },
    }))
  }, [])

  const updateContacts = useCallback((contacts: Contact[]) => {
    setData((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, contacts },
    }))
  }, [])

  const updateLanguages = useCallback((languages: Language[]) => {
    setData((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, languages },
    }))
  }, [])

  const updatePortfolio = useCallback((portfolioUrl: string, portfolioLabel: string) => {
    setData((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, portfolioUrl, portfolioLabel },
    }))
  }, [])

  // Reset to default
  const resetToDefault = useCallback(() => {
    setData(defaultData as Resume)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Export JSON
  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [data])

  // Import JSON
  const importJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json)
      setData(parsed)
      return true
    } catch {
      return false
    }
  }, [])

  return {
    data,
    setData,
    updateName,
    updateSubtitle,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
    moveItem,
    updateSkills,
    updateSoftware,
    updateContacts,
    updateLanguages,
    updatePortfolio,
    resetToDefault,
    exportJSON,
    importJSON,
  }
}
