const ALLOWED_TAGS = ['strong', 'em', 'u', 'a', 'br', 'b', 'i']

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
}

export function sanitizeHtml(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const sanitizeNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode()
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()

      if (!ALLOWED_TAGS.includes(tagName)) {
        const fragment = document.createDocumentFragment()
        for (const child of Array.from(node.childNodes)) {
          const sanitized = sanitizeNode(child)
          if (sanitized) fragment.appendChild(sanitized)
        }
        return fragment
      }

      const newElement = document.createElement(tagName)

      const normalizedTag = tagName === 'b' ? 'strong' : tagName === 'i' ? 'em' : tagName
      const finalElement =
        normalizedTag !== tagName ? document.createElement(normalizedTag) : newElement

      const allowedAttrs = ALLOWED_ATTRS[tagName] || []
      for (const attr of allowedAttrs) {
        const value = element.getAttribute(attr)
        if (value !== null) {
          if (attr === 'href') {
            const lowerValue = value.toLowerCase().trim()
            if (lowerValue.startsWith('javascript:') || lowerValue.startsWith('data:')) {
              continue
            }
          }
          finalElement.setAttribute(attr, value)
        }
      }

      if (tagName === 'a') {
        finalElement.setAttribute('target', '_blank')
        finalElement.setAttribute('rel', 'noopener noreferrer')
      }

      for (const child of Array.from(node.childNodes)) {
        const sanitized = sanitizeNode(child)
        if (sanitized) finalElement.appendChild(sanitized)
      }

      return finalElement
    }

    return null
  }

  const fragment = document.createDocumentFragment()
  for (const child of Array.from(doc.body.childNodes)) {
    const sanitized = sanitizeNode(child)
    if (sanitized) fragment.appendChild(sanitized)
  }

  const tempDiv = document.createElement('div')
  tempDiv.appendChild(fragment)
  return tempDiv.innerHTML
}
