import { useMemo } from 'react'

export function useEditMode(): boolean {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.has('edit')
  }, [])
}
