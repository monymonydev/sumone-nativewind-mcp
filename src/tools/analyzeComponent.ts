import { readFileSync } from 'fs'
import type { AnalysisResult } from '../parsers/types.js'
import { parseStyledComponents } from '../parsers/styledComponents.js'
import { parseTamaguiStyled } from '../parsers/tamagui.js'
import { parseUiCoreProps } from '../parsers/uiCore.js'

export type AnalyzeComponentInput = {
  filePath: string
}

export function analyzeComponent(input: AnalyzeComponentInput): AnalysisResult {
  const sourceCode = readFileSync(input.filePath, 'utf-8')

  const styledComponents = parseStyledComponents(sourceCode)
  const tamaguiStyled = parseTamaguiStyled(sourceCode)
  const uiCoreProps = parseUiCoreProps(sourceCode)

  // Collect all tokens used
  const tokens = new Set<string>()

  for (const pattern of styledComponents) {
    for (const ref of pattern.themeReferences) {
      tokens.add(ref)
    }
  }

  for (const pattern of tamaguiStyled) {
    for (const value of Object.values(pattern.staticStyles)) {
      if (typeof value === 'string' && value.startsWith('$')) {
        tokens.add(value)
      }
    }
    for (const variant of pattern.variants) {
      for (const variantValue of variant.values) {
        for (const value of Object.values(variantValue.styles)) {
          if (typeof value === 'string' && value.startsWith('$')) {
            tokens.add(value)
          }
        }
      }
    }
  }

  for (const pattern of uiCoreProps) {
    for (const prop of pattern.props) {
      if (prop.tamaguiToken) {
        tokens.add(prop.tamaguiToken)
      }
    }
  }

  // Calculate summary
  const allPatterns = [
    ...styledComponents,
    ...tamaguiStyled,
    ...uiCoreProps,
  ]
  const totalPatterns = allPatterns.length
  const autoConvertible = allPatterns.filter((p) => p.isAutoConvertible).length

  // AI-assisted = has variants but no dynamic functions
  const aiAssisted = tamaguiStyled.filter(
    (p) => p.variants.length > 0 && !p.variants.some((v) => v.isDynamic)
  ).length

  // Manual = dynamic props, theme refs, or dynamic variants
  const manualRequired = totalPatterns - autoConvertible - aiAssisted

  return {
    file: input.filePath,
    patterns: {
      styledComponents,
      tamaguiStyled,
      uiCoreProps,
    },
    summary: {
      totalPatterns,
      autoConvertible,
      aiAssisted,
      manualRequired,
    },
    tokens: Array.from(tokens),
  }
}
