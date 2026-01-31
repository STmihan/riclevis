// Section types for main content
export type SectionType = 'text' | 'career' | 'projects'

// Text section (like "About")
export interface TextContent {
  text: string
}

// Link with text
export interface LinkItem {
  url: string
  text: string
}

// Career section (like "Work Experience")
export interface CareerItem {
  title: string
  description: string
  links?: LinkItem[]
}

export interface CareerContent {
  role: string
  period: string
  items: CareerItem[]
}

// Projects section (like "Game Jams")
export interface ProjectItem {
  name: string
  duration: string
  description: string
  link?: LinkItem
}

export interface ProjectsContent {
  items: ProjectItem[]
}

// Generic section
export interface Section {
  id: string
  type: SectionType
  title: string
  content: TextContent | CareerContent | ProjectsContent
}

// Contact item
export interface Contact {
  icon: string // filename in public/icons/
  label: string
  url?: string
}

// Language item
export interface Language {
  name: string
  level: string
}

// Sidebar structure (fixed sections)
export interface Sidebar {
  qrCodeUrl: string
  portfolioUrl: string
  portfolioLabel: string
  contacts: Contact[]
  skills: string[]
  software: string[]
  languages: Language[]
}

// Full resume structure
export interface Resume {
  name: string
  subtitle: string
  sidebar: Sidebar
  sections: Section[]
}

// Type guards
export function isTextContent(
  content: TextContent | CareerContent | ProjectsContent
): content is TextContent {
  return 'text' in content
}

export function isCareerContent(
  content: TextContent | CareerContent | ProjectsContent
): content is CareerContent {
  return 'role' in content && 'period' in content
}

export function isProjectsContent(
  content: TextContent | CareerContent | ProjectsContent
): content is ProjectsContent {
  return 'items' in content && !('role' in content)
}
