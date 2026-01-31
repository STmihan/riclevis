import type {
  SectionType,
  TextContent,
  CareerContent,
  ProjectsContent,
  Section,
} from '../types/resume'

const defaultContent: Record<SectionType, TextContent | CareerContent | ProjectsContent> = {
  text: {
    text: { ru: 'Введите описание...', en: 'Enter description...' },
  },
  career: {
    role: { ru: 'Должность', en: 'Position' },
    period: { ru: '20XX - настоящее время', en: '20XX - present' },
    items: [
      {
        title: { ru: 'Проект', en: 'Project' },
        description: { ru: 'Описание проекта', en: 'Project description' },
      },
    ],
  },
  projects: {
    items: [
      {
        name: { ru: 'Название проекта', en: 'Project name' },
        duration: { ru: '3 дня', en: '3 days' },
        description: { ru: 'Описание проекта', en: 'Project description' },
      },
    ],
  },
}

const defaultTitles: Record<SectionType, { ru: string; en: string }> = {
  text: { ru: 'Новая секция', en: 'New Section' },
  career: { ru: 'Опыт работы', en: 'Experience' },
  projects: { ru: 'Проекты', en: 'Projects' },
}

export function createSection(type: SectionType): Section {
  const id = `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  return {
    id,
    type,
    title: defaultTitles[type],
    content: JSON.parse(JSON.stringify(defaultContent[type])),
  }
}
