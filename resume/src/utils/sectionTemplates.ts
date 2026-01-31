import type {
  SectionType,
  TextContent,
  CareerContent,
  ProjectsContent,
  Section,
} from '../types/resume'

export const defaultContent: Record<SectionType, TextContent | CareerContent | ProjectsContent> = {
  text: {
    text: 'Введите описание...',
  },
  career: {
    role: 'Должность',
    period: '20XX - настоящее время',
    items: [
      {
        title: 'Проект',
        description: 'Описание проекта',
      },
    ],
  },
  projects: {
    items: [
      {
        name: 'Название проекта',
        duration: '3 дня',
        description: 'Описание проекта',
      },
    ],
  },
}

export const sectionLabels: Record<SectionType, { title: string; description: string }> = {
  text: {
    title: 'Текстовая секция',
    description: 'Для описаний, "О себе" и т.д.',
  },
  career: {
    title: 'Опыт работы',
    description: 'Должность, период и список проектов',
  },
  projects: {
    title: 'Проекты',
    description: 'Список проектов или Game Jams',
  },
}

export const defaultTitles: Record<SectionType, string> = {
  text: 'Новая секция',
  career: 'Опыт работы',
  projects: 'Проекты',
}

export function createSection(type: SectionType): Section {
  const id = `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  return {
    id,
    type,
    title: defaultTitles[type],
    content: JSON.parse(JSON.stringify(defaultContent[type])), // Deep clone
  }
}
