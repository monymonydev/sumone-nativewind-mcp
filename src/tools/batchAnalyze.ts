import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { analyzeComponent } from './analyzeComponent.js'
import type { AnalysisResult } from '../parsers/types.js'

export type BatchAnalyzeInput = {
  directory: string
  pattern?: string
  limit?: number
}

export type BatchAnalyzeOutput = {
  totalFiles: number
  analyzed: number
  summary: {
    fullyAutoConvertible: number
    partiallyAutoConvertible: number
    manualRequired: number
  }
  byPattern: {
    styledComponents: { files: number; occurrences: number }
    tamaguiStyled: { files: number; occurrences: number }
    uiCoreProps: { files: number; occurrences: number }
  }
  tokenUsage: Record<string, number>
  complexCases: Array<{
    filePath: string
    reason: string
  }>
}

export function batchAnalyze(input: BatchAnalyzeInput): BatchAnalyzeOutput {
  const { directory, pattern = '**/*.tsx', limit = 100 } = input

  const files = findFiles(directory, pattern, limit)
  const results: AnalysisResult[] = []

  for (const file of files) {
    try {
      const result = analyzeComponent({ filePath: file })
      results.push(result)
    } catch {
      // Skip files that can't be parsed
    }
  }

  // Aggregate results
  const tokenUsage: Record<string, number> = {}
  const complexCases: BatchAnalyzeOutput['complexCases'] = []

  let styledComponentsFiles = 0
  let styledComponentsOccurrences = 0
  let tamaguiStyledFiles = 0
  let tamaguiStyledOccurrences = 0
  let uiCorePropsFiles = 0
  let uiCorePropsOccurrences = 0

  let fullyAutoConvertible = 0
  let partiallyAutoConvertible = 0
  let manualRequired = 0

  for (const result of results) {
    // Count patterns by file
    if (result.patterns.styledComponents.length > 0) {
      styledComponentsFiles++
      styledComponentsOccurrences += result.patterns.styledComponents.length
    }
    if (result.patterns.tamaguiStyled.length > 0) {
      tamaguiStyledFiles++
      tamaguiStyledOccurrences += result.patterns.tamaguiStyled.length
    }
    if (result.patterns.uiCoreProps.length > 0) {
      uiCorePropsFiles++
      uiCorePropsOccurrences += result.patterns.uiCoreProps.length
    }

    // Count tokens
    for (const token of result.tokens) {
      tokenUsage[token] = (tokenUsage[token] || 0) + 1
    }

    // Categorize file
    if (result.summary.totalPatterns === 0) {
      continue
    }

    if (result.summary.autoConvertible === result.summary.totalPatterns) {
      fullyAutoConvertible++
    } else if (result.summary.autoConvertible > 0) {
      partiallyAutoConvertible++
    } else {
      manualRequired++
    }

    // Record complex cases
    if (result.summary.manualRequired > 0) {
      const reasons: string[] = []

      for (const pattern of result.patterns.styledComponents) {
        if (!pattern.isAutoConvertible) {
          if (pattern.dynamicProps.length > 0) {
            reasons.push(`Dynamic props: ${pattern.dynamicProps.join(', ')}`)
          }
          if (pattern.themeReferences.length > 0) {
            reasons.push(`Theme refs: ${pattern.themeReferences.length}`)
          }
        }
      }

      for (const pattern of result.patterns.tamaguiStyled) {
        if (pattern.variants.some((v) => v.isDynamic)) {
          reasons.push('Dynamic Tamagui variants')
        }
      }

      if (reasons.length > 0) {
        complexCases.push({
          filePath: result.file,
          reason: reasons.join('; '),
        })
      }
    }
  }

  return {
    totalFiles: files.length,
    analyzed: results.length,
    summary: {
      fullyAutoConvertible,
      partiallyAutoConvertible,
      manualRequired,
    },
    byPattern: {
      styledComponents: {
        files: styledComponentsFiles,
        occurrences: styledComponentsOccurrences,
      },
      tamaguiStyled: {
        files: tamaguiStyledFiles,
        occurrences: tamaguiStyledOccurrences,
      },
      uiCoreProps: {
        files: uiCorePropsFiles,
        occurrences: uiCorePropsOccurrences,
      },
    },
    tokenUsage,
    complexCases,
  }
}

function findFiles(directory: string, pattern: string, limit: number): string[] {
  const files: string[] = []
  const extensions = ['.tsx', '.ts']

  function walk(dir: string) {
    if (files.length >= limit) return

    try {
      const entries = readdirSync(dir)
      for (const entry of entries) {
        if (files.length >= limit) return

        const fullPath = join(dir, entry)

        try {
          const stat = statSync(fullPath)

          if (stat.isDirectory()) {
            // Skip node_modules and common non-source dirs
            if (
              entry === 'node_modules' ||
              entry === 'dist' ||
              entry === '.git' ||
              entry === 'build'
            ) {
              continue
            }
            walk(fullPath)
          } else if (stat.isFile()) {
            const hasExtension = extensions.some((ext) =>
              fullPath.endsWith(ext)
            )
            if (hasExtension) {
              // Simple pattern matching (just *.tsx for now)
              if (pattern === '**/*.tsx' && fullPath.endsWith('.tsx')) {
                files.push(fullPath)
              } else if (pattern === '**/*.ts' && fullPath.endsWith('.ts')) {
                files.push(fullPath)
              } else if (pattern === '**/*' || pattern === '*') {
                files.push(fullPath)
              }
            }
          }
        } catch {
          // Skip inaccessible files
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }

  walk(directory)
  return files
}
