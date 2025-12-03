import type { StyledComponentPattern, CSSProperty } from './types.js'

// Pattern to match styled components: styled.View, styled.View<Props>, styled(Component)
const STYLED_PATTERN = /const\s+(\w+)\s*=\s*styled(?:\.(\w+)(?:<[^>]*>)?|(?:<[^>]*>)?\((\w+)\))/g
// Pattern for template literals (handles multiline)
const TEMPLATE_LITERAL_PATTERN = /`([\s\S]*?)`/
// Pattern for dynamic expressions - needs to handle nested braces
// We'll extract these manually instead of with a simple regex
const CSS_PROPERTY_PATTERN = /([a-z-]+)\s*:\s*([^;$`]+)/gi
const THEME_REFERENCE_PATTERN = /theme\.[a-zA-Z.]+/g

export function parseStyledComponents(sourceCode: string): StyledComponentPattern[] {
  const patterns: StyledComponentPattern[] = []
  const lines = sourceCode.split('\n')

  // Find all styled component definitions
  let match: RegExpExecArray | null
  const styledRegex = new RegExp(STYLED_PATTERN.source, 'g')

  while ((match = styledRegex.exec(sourceCode)) !== null) {
    const componentName = match[1]
    const baseElement = match[2] || match[3] || 'unknown'
    const startIndex = match.index
    const lineNumber = sourceCode.substring(0, startIndex).split('\n').length

    // Find the template literal after the styled call
    const afterStyled = sourceCode.substring(match.index + match[0].length)
    const templateMatch = afterStyled.match(TEMPLATE_LITERAL_PATTERN)

    if (templateMatch) {
      const templateContent = templateMatch[1]
      const rawCode = match[0] + templateMatch[0]

      // Parse CSS properties
      const cssProperties = parseCSSProperties(templateContent)

      // Find dynamic expressions (${...}) with proper brace counting
      const dynamicMatches = extractDynamicExpressions(templateContent)
      const dynamicProps = extractDynamicProps(dynamicMatches)

      // Find theme references
      const themeMatches = templateContent.match(THEME_REFERENCE_PATTERN) || []

      // Determine if auto-convertible
      const isAutoConvertible =
        dynamicMatches.length === 0 && themeMatches.length === 0

      patterns.push({
        componentName,
        baseElement,
        cssProperties,
        dynamicProps,
        themeReferences: themeMatches,
        isAutoConvertible,
        sourceLocation: { line: lineNumber, column: 0 },
        rawCode,
      })
    }
  }

  return patterns
}

function parseCSSProperties(templateContent: string): CSSProperty[] {
  const properties: CSSProperty[] = []

  // Replace dynamic expressions with placeholder for parsing
  let cleanContent = templateContent
  const dynamicExpressions = extractDynamicExpressions(templateContent)
  for (const expr of dynamicExpressions) {
    cleanContent = cleanContent.replace(expr, '__DYNAMIC__')
  }

  let propMatch: RegExpExecArray | null
  const propRegex = new RegExp(CSS_PROPERTY_PATTERN.source, 'gi')

  while ((propMatch = propRegex.exec(cleanContent)) !== null) {
    const property = propMatch[1].trim()
    const value = propMatch[2].trim()
    const isDynamic = value.includes('__DYNAMIC__')

    properties.push({
      property: kebabToCamel(property),
      value: isDynamic ? 'dynamic' : value,
      isStatic: !isDynamic,
    })
  }

  return properties
}

function extractDynamicProps(dynamicMatches: string[]): string[] {
  const props = new Set<string>()

  for (const match of dynamicMatches) {
    // Extract prop names from ${({prop1, prop2}) => ...}
    const destructuredMatch = match.match(/\(\{([^}]+)\}\)/)
    if (destructuredMatch) {
      const propNames = destructuredMatch[1].split(',').map((p) => p.trim())
      propNames.forEach((p) => props.add(p))
    }

    // Extract prop names from ${props.propName}
    const propsMatch = match.match(/props\.(\w+)/g)
    if (propsMatch) {
      propsMatch.forEach((p) => props.add(p.replace('props.', '')))
    }
  }

  return Array.from(props)
}

function extractDynamicExpressions(template: string): string[] {
  const expressions: string[] = []
  let i = 0

  while (i < template.length) {
    // Look for ${
    if (template[i] === '$' && template[i + 1] === '{') {
      const startIndex = i
      i += 2 // Skip ${
      let depth = 1

      while (i < template.length && depth > 0) {
        if (template[i] === '{') depth++
        else if (template[i] === '}') depth--
        i++
      }

      // Extract the expression including ${...}
      expressions.push(template.substring(startIndex, i))
    } else {
      i++
    }
  }

  return expressions
}

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}
