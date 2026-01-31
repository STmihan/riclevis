// Allowed HTML tags for rich text
const ALLOWED_TAGS = ['strong', 'em', 'u', 'a', 'br', 'b', 'i']

// Allowed attributes for specific tags
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
}

/**
 * Sanitize HTML string to only allow safe tags and attributes
 * Prevents XSS while allowing basic formatting
 */
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

      // Check if tag is allowed
      if (!ALLOWED_TAGS.includes(tagName)) {
        // Return text content for disallowed tags
        const fragment = document.createDocumentFragment()
        for (const child of Array.from(node.childNodes)) {
          const sanitized = sanitizeNode(child)
          if (sanitized) fragment.appendChild(sanitized)
        }
        return fragment
      }

      // Create new element with only allowed attributes
      const newElement = document.createElement(tagName)

      // Normalize b/i to strong/em
      const normalizedTag = tagName === 'b' ? 'strong' : tagName === 'i' ? 'em' : tagName
      const finalElement =
        normalizedTag !== tagName ? document.createElement(normalizedTag) : newElement

      // Copy allowed attributes
      const allowedAttrs = ALLOWED_ATTRS[tagName] || []
      for (const attr of allowedAttrs) {
        const value = element.getAttribute(attr)
        if (value !== null) {
          // Sanitize href to prevent javascript: URLs
          if (attr === 'href') {
            const lowerValue = value.toLowerCase().trim()
            if (lowerValue.startsWith('javascript:') || lowerValue.startsWith('data:')) {
              continue
            }
          }
          finalElement.setAttribute(attr, value)
        }
      }

      // Add safety attributes for links
      if (tagName === 'a') {
        finalElement.setAttribute('target', '_blank')
        finalElement.setAttribute('rel', 'noopener noreferrer')
      }

      // Recursively sanitize children
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

/**
 * Convert plain text to HTML-safe string (escape special characters)
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Check if string contains any HTML tags
 */
export function containsHtml(text: string): boolean {
  return /<[^>]+>/.test(text)
}
