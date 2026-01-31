import { useEffect, useCallback } from 'react'
import { useStore } from 'zustand'
import { useResumeStore } from '../store/resumeStore'

export function useUndoRedo() {
  const temporalStore = useResumeStore.temporal
  const pastStates = useStore(temporalStore, (s) => s.pastStates)
  const futureStates = useStore(temporalStore, (s) => s.futureStates)

  const undo = useCallback(() => {
    temporalStore.getState().undo()
  }, [temporalStore])

  const redo = useCallback(() => {
    temporalStore.getState().redo()
  }, [temporalStore])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  return {
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
    undo,
    redo,
  }
}
