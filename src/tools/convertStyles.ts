import { readFileSync } from 'fs'
import type { ConversionResult, SkippedConversion } from '../parsers/types.js'
import { parseStyledComponents } from '../parsers/styledComponents.js'
import { parseTamaguiStyled } from '../parsers/tamagui.js'
import { parseUiCoreProps } from '../parsers/uiCore.js'
import {
  convertStyledComponent,
  convertTamaguiStyled,
  convertUiCoreProps,
} from '../converters/simpleConverter.js'

export type ConvertStylesInput = {
  filePath: string
  dryRun?: boolean
}

export type ConvertStylesOutput = {
  conversions: ConversionResult[]
  skipped: SkippedConversion[]
}

export function convertStyles(input: ConvertStylesInput): ConvertStylesOutput {
  const sourceCode = readFileSync(input.filePath, 'utf-8')

  const conversions: ConversionResult[] = []
  const skipped: SkippedConversion[] = []

  // Process styled-components
  const styledComponents = parseStyledComponents(sourceCode)
  for (const pattern of styledComponents) {
    const result = convertStyledComponent(pattern)
    conversions.push(...result.conversions)
    skipped.push(...result.skipped)
  }

  // Process Tamagui styled
  const tamaguiStyled = parseTamaguiStyled(sourceCode)
  for (const pattern of tamaguiStyled) {
    const result = convertTamaguiStyled(pattern)
    conversions.push(...result.conversions)
    skipped.push(...result.skipped)
  }

  // Process ui-core props
  const uiCoreProps = parseUiCoreProps(sourceCode)
  for (const pattern of uiCoreProps) {
    const result = convertUiCoreProps(pattern)
    conversions.push(...result.conversions)
    skipped.push(...result.skipped)
  }

  // Sort by line number
  conversions.sort((a, b) => a.lineNumber - b.lineNumber)
  skipped.sort((a, b) => a.lineNumber - b.lineNumber)

  return { conversions, skipped }
}
