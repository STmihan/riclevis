import { useUIStore } from '../store/uiStore'
import type { LocalizedString } from '../types/resume'

export function useLocalized() {
  const displayLang = useUIStore((s) => s.displayLang)

  return function t(value: LocalizedString | string | undefined): string {
    if (!value) return ''
    if (typeof value === 'string') return value
    return value[displayLang] || value['en'] || value['ru'] || Object.values(value)[0] || ''
  }
}

export function getLocalizedField(value: LocalizedString | undefined, lang: string): string {
  if (!value) return ''
  return value[lang] || ''
}

export function setLocalizedField(
  value: LocalizedString | undefined,
  lang: string,
  text: string
): LocalizedString {
  return { ...value, [lang]: text }
}
