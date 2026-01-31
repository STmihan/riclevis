import type { TextContent, LocalizedString } from '../../types/resume'
import { EditableText } from '../EditableText'
import { RichText } from '../RichText'
import { useResumeStore } from '../../store/resumeStore'
import { useUIStore } from '../../store/uiStore'
import { useLocalized, getLocalizedField, setLocalizedField } from '../../utils/localized'

interface Props {
  id: string
  title: LocalizedString
  content: TextContent
}

export function TextSection({ id, title, content }: Props) {
  const { updateSection, isEditMode } = useResumeStore()
  const displayLang = useUIStore((s) => s.displayLang)
  const loc = useLocalized()

  const handleTitleChange = (newTitle: string) => {
    updateSection(id, { title: setLocalizedField(title, displayLang, newTitle) })
  }

  const handleTextChange = (newText: string) => {
    updateSection(id, {
      content: { text: setLocalizedField(content.text, displayLang, newText) },
    })
  }

  return (
    <section>
      <h2
        style={{
          fontSize: '18px',
          textTransform: 'uppercase',
          color: '#333',
          borderBottom: '2px solid #333',
          paddingBottom: '5px',
          marginBottom: '20px',
          marginTop: '10px',
          fontWeight: 'bold',
        }}
      >
        <EditableText
          value={isEditMode ? getLocalizedField(title, displayLang) : loc(title)}
          onChange={handleTitleChange}
        />
      </h2>
      <p style={{ fontSize: '14px', marginBottom: '30px', color: '#333' }}>
        <RichText
          value={isEditMode ? getLocalizedField(content.text, displayLang) : loc(content.text)}
          onChange={handleTextChange}
        />
      </p>
    </section>
  )
}
