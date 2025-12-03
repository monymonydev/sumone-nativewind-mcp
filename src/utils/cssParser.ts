// CSS parsing utilities for template literals

export type ParsedCSS = {
  property: string
  value: string
  isDynamic: boolean
}

export function parseCSSFromTemplate(template: string): ParsedCSS[] {
  const properties: ParsedCSS[] = []
  const lines = template.split(';').filter((l) => l.trim())

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const property = line.substring(0, colonIndex).trim()
    const value = line.substring(colonIndex + 1).trim()

    // Check for dynamic values (${...})
    const isDynamic = value.includes('${') || value.includes('__DYNAMIC__')

    properties.push({
      property: kebabToCamel(property),
      value: isDynamic ? 'dynamic' : value,
      isDynamic,
    })
  }

  return properties
}

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}
