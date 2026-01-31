import type { TextContent } from '../../types/resume'
import { EditableText } from '../EditableText'
import { RichText } from '../RichText'
import { useResumeContext } from '../../context/ResumeContext'

interface Props {
  id: string
  title: string
  content: TextContent
}

export function TextSection({ id, title, content }: Props) {
  const { updateSection } = useResumeContext()

  const handleTitleChange = (newTitle: string) => {
    updateSection(id, { title: newTitle })
  }

  const handleTextChange = (newText: string) => {
    updateSection(id, { content: { text: newText } })
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
        <EditableText value={title} onChange={handleTitleChange} />
      </h2>
      <p style={{ fontSize: '14px', marginBottom: '30px', color: '#333' }}>
        <RichText value={content.text} onChange={handleTextChange} />
      </p>
    </section>
  )
}
