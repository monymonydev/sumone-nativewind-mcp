import type { TamaguiStyledPattern, TamaguiVariant } from './types.js'

// Match styled(Component, config) - capture component name and start of config
const TAMAGUI_STYLED_START = /const\s+(\w+)\s*=\s*styled\s*\(\s*(\w+)\s*,\s*\{/g

export function parseTamaguiStyled(sourceCode: string): TamaguiStyledPattern[] {
  const patterns: TamaguiStyledPattern[] = []

  let match: RegExpExecArray | null
  const styledRegex = new RegExp(TAMAGUI_STYLED_START.source, 'g')

  while ((match = styledRegex.exec(sourceCode)) !== null) {
    const componentName = match[1]
    const baseComponent = match[2]
    const startIndex = match.index
    const configStartIndex = match.index + match[0].length - 1 // Position of opening {
    const lineNumber = sourceCode.substring(0, startIndex).split('\n').length

    // Extract the full config object by counting braces
    const configStr = extractBalancedBraces(sourceCode, configStartIndex)
    if (!configStr) continue

    const rawCode = match[0].slice(0, -1) + configStr + ')'

    try {
      const { staticStyles, variants } = parseConfig(configStr)

      // Auto-convertible if no variants
      const hasVariants = variants.length > 0

      patterns.push({
        componentName,
        baseComponent,
        staticStyles,
        variants,
        isAutoConvertible: !hasVariants,
        sourceLocation: { line: lineNumber, column: 0 },
        rawCode,
      })
    } catch {
      // If parsing fails, still record the pattern as non-auto-convertible
      patterns.push({
        componentName,
        baseComponent,
        staticStyles: {},
        variants: [],
        isAutoConvertible: false,
        sourceLocation: { line: lineNumber, column: 0 },
        rawCode,
      })
    }
  }

  return patterns
}

function extractBalancedBraces(source: string, startIndex: number): string | null {
  if (source[startIndex] !== '{') return null

  let depth = 0
  let i = startIndex

  while (i < source.length) {
    const char = source[i]
    if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) {
        return source.substring(startIndex, i + 1)
      }
    }
    i++
  }

  return null
}

function parseConfig(configStr: string): {
  staticStyles: Record<string, string | number>
  variants: TamaguiVariant[]
} {
  const staticStyles: Record<string, string | number> = {}
  const variants: TamaguiVariant[] = []

  // Extract key-value pairs for static styles (simplified parsing)
  const styleMatches = configStr.matchAll(
    /(\w+)\s*:\s*(?:'([^']*)'|"([^"]*)"|(\$\w+)|(\d+))\s*[,}]/g
  )

  for (const match of styleMatches) {
    const key = match[1]
    if (key === 'name' || key === 'variants') continue

    const value = match[2] || match[3] || match[4] || match[5]
    if (value) {
      staticStyles[key] = /^\d+$/.test(value) ? parseInt(value, 10) : value
    }
  }

  // Check for variants block using brace counting
  const variantsStartMatch = configStr.match(/variants\s*:\s*\{/)
  if (variantsStartMatch && variantsStartMatch.index !== undefined) {
    const variantsStartIndex = variantsStartMatch.index + variantsStartMatch[0].length - 1
    const variantsBlock = extractBalancedBraces(configStr, variantsStartIndex)
    if (variantsBlock) {
      // Remove outer braces
      const variantsContent = variantsBlock.slice(1, -1)
      const variantBlocks = parseVariantsBlock(variantsContent)
      variants.push(...variantBlocks)
    }
  }

  return { staticStyles, variants }
}

function parseVariantsBlock(variantsContent: string): TamaguiVariant[] {
  const variants: TamaguiVariant[] = []

  // Match variant names followed by : {
  const variantNamePattern = /(\w+)\s*:\s*\{/g
  let match: RegExpExecArray | null

  while ((match = variantNamePattern.exec(variantsContent)) !== null) {
    const variantName = match[1]
    const blockStartIndex = match.index + match[0].length - 1
    const variantBlock = extractBalancedBraces(variantsContent, blockStartIndex)

    if (!variantBlock) continue

    const variantValuesContent = variantBlock.slice(1, -1)

    // Check if it's a function (dynamic variant)
    const isDynamic = variantValuesContent.includes('=>')

    const values: TamaguiVariant['values'] = []

    if (!isDynamic) {
      // Parse static variant values using brace counting
      const valueNamePattern = /(\w+|\$\w+)\s*:\s*\{/g
      let valueMatch: RegExpExecArray | null

      while ((valueMatch = valueNamePattern.exec(variantValuesContent)) !== null) {
        const valueName = valueMatch[1]
        const valueBlockStart = valueMatch.index + valueMatch[0].length - 1
        const valueBlock = extractBalancedBraces(variantValuesContent, valueBlockStart)

        if (valueBlock) {
          const styleStr = valueBlock.slice(1, -1)
          const styles = parseStyleString(styleStr)
          values.push({ name: valueName, styles })
        }
      }
    }

    variants.push({
      name: variantName,
      values,
      isDynamic,
    })
  }

  return variants
}

function parseStyleString(styleStr: string): Record<string, string | number> {
  const styles: Record<string, string | number> = {}

  const matches = styleStr.matchAll(
    /(\w+)\s*:\s*(?:'([^']*)'|"([^"]*)"|(\$\w+)|(\d+))/g
  )

  for (const match of matches) {
    const key = match[1]
    const value = match[2] || match[3] || match[4] || match[5]
    if (value) {
      styles[key] = /^\d+$/.test(value) ? parseInt(value, 10) : value
    }
  }

  return styles
}
