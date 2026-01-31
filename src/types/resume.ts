export type LocalizedString = { [lang: string]: string }

export type SectionType = 'text' | 'career' | 'projects'

export interface TextContent {
  text: LocalizedString
}

export interface LinkItem {
  url: string
  text: string
}

export interface CareerItem {
  title: LocalizedString
  description: LocalizedString
  links?: LinkItem[]
}

export interface CareerContent {
  role: LocalizedString
  period: LocalizedString
  items: CareerItem[]
}

export interface ProjectItem {
  name: LocalizedString
  duration: LocalizedString
  description: LocalizedString
  link?: LinkItem
}

export interface ProjectsContent {
  items: ProjectItem[]
}

export interface Section {
  id: string
  type: SectionType
  title: LocalizedString
  content: TextContent | CareerContent | ProjectsContent
}

export interface Contact {
  icon: string
  label: LocalizedString
  url?: string
}

export interface Language {
  name: LocalizedString
  level: LocalizedString
}

export interface SidebarLabels {
  contacts: LocalizedString
  skills: LocalizedString
  software: LocalizedString
  languages: LocalizedString
}

export interface Sidebar {
  labels: SidebarLabels
  qrCodeUrl: string
  portfolioUrl: string
  portfolioLabel: string
  contacts: Contact[]
  skills: LocalizedString[]
  software: LocalizedString[]
  languages: Language[]
}

export interface Resume {
  name: LocalizedString
  subtitle: LocalizedString
  sidebar: Sidebar
  sections: Section[]
}

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
