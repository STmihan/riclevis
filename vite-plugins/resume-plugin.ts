import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import type { Plugin, ResolvedConfig } from 'vite'

interface ResumeData {
  name: { ru: string; en: string }
  subtitle: { ru: string; en: string }
  sidebar: {
    portfolioUrl: string
    contacts: Array<{ icon: string; label: { ru: string; en: string }; url?: string }>
  }
  sections: Array<{
    id: string
    type: string
    title: { ru: string; en: string }
    content: { text?: { ru: string; en: string } }
  }>
}

const VIRTUAL_ICONS_ID = 'virtual:icons'
const RESOLVED_VIRTUAL_ICONS_ID = '\0' + VIRTUAL_ICONS_ID

export function resumePlugin(): Plugin {
  let config: ResolvedConfig
  let icons: string[] = []

  return {
    name: 'resume-plugin',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    buildStart() {
      const iconsDir = join(config.root, 'public', 'icons')
      try {
        icons = readdirSync(iconsDir)
          .filter((file) => file.endsWith('.svg'))
          .sort()
      } catch {
        icons = []
        console.warn('[resume-plugin] Could not read icons directory')
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_ICONS_ID) {
        return RESOLVED_VIRTUAL_ICONS_ID
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ICONS_ID) {
        return `export const AVAILABLE_ICONS = ${JSON.stringify(icons)};`
      }
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (config.command !== 'build') {
          return html
        }

        const resumePath = join(config.root, 'public', 'resume.json')
        let resume: ResumeData
        try {
          resume = JSON.parse(readFileSync(resumePath, 'utf-8'))
        } catch {
          console.warn('[resume-plugin] Could not read resume.json for SEO')
          return html
        }

        const name = resume.name.en.replace(/\n/g, ' ')
        const subtitle = resume.subtitle.en
        const aboutSection = resume.sections.find((s) => s.id === 'about')
        const description = aboutSection?.content.text?.en || subtitle
        const portfolioUrl = resume.sidebar.portfolioUrl

        const metaTags = `
    <title>${name} - ${subtitle}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="${escapeHtml(name)}" />

    <meta property="og:type" content="profile" />
    <meta property="og:title" content="${escapeHtml(name)} - ${escapeHtml(subtitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:site_name" content="${escapeHtml(name)} Resume" />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(name)} - ${escapeHtml(subtitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    ${JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: name,
        jobTitle: subtitle,
        description: description,
        url: portfolioUrl,
        sameAs: [portfolioUrl],
      },
      null,
      2
    )}
    </script>`

        return html.replace(/<title>.*?<\/title>/, '').replace('</head>', `${metaTags}\n  </head>`)
      },
    },
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
