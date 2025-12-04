import type { MigrationSpec } from '../parsers/types.js'
import { parseTamaguiStyled } from '../parsers/tamagui.js'
import { parseUiCoreProps } from '../parsers/uiCore.js'
import { parseStyledComponents } from '../parsers/styledComponents.js'
import { generateCvaConfig } from '../converters/cvaGenerator.js'
import { convertProperty } from '../converters/rules.js'
import { mapToken, mapLegacyColorToken, LEGACY_COLOR_MIGRATIONS } from '../tokens/index.js'

// Patterns that indicate legacy theme usage
const LEGACY_THEME_PATTERNS = [
  /theme\.main\.colors\.\w+/g,
  /theme\.fonts\.\w+/g,
  /theme\.colors\.\w+/g,
  /colors\.(mono|main|sub|point|error|gray)\d+/g,
]

function detectLegacyPatterns(code: string): {
  legacyTokens: string[]
  warnings: string[]
} {
  const legacyTokens: string[] = []
  const warnings: string[] = []

  for (const pattern of LEGACY_THEME_PATTERNS) {
    const matches = code.matchAll(pattern)
    for (const match of matches) {
      const token = match[0]
      if (!legacyTokens.includes(token)) {
        legacyTokens.push(token)

        // Check if there's a migration recommendation
        const colorName = token.split('.').pop() || ''
        const migrationTarget = LEGACY_COLOR_MIGRATIONS[colorName as keyof typeof LEGACY_COLOR_MIGRATIONS]
        if (migrationTarget) {
          warnings.push(
            `Legacy "${token}" -> can migrate to design system "${migrationTarget}"`
          )
        } else {
          warnings.push(
            `Legacy "${token}" -> use legacy-* prefix (e.g., bg-legacy-mono-100)`
          )
        }
      }
    }
  }

  return { legacyTokens, warnings }
}

export type SuggestMigrationInput = {
  code: string
  context?: string
}

export function suggestMigration(input: SuggestMigrationInput): MigrationSpec {
  const { code, context } = input

  // Detect legacy patterns first
  const { legacyTokens, warnings: legacyWarnings } = detectLegacyPatterns(code)

  // Try to parse as different patterns
  const styledComponents = parseStyledComponents(code)
  const tamaguiStyled = parseTamaguiStyled(code)
  const uiCoreProps = parseUiCoreProps(code)

  // Tamagui with variants - generate cva config
  if (tamaguiStyled.length > 0 && tamaguiStyled[0].variants.length > 0) {
    const result = generateCvaConfig(tamaguiStyled[0])
    result.warnings = [...(result.warnings || []), ...legacyWarnings]
    if (legacyTokens.length > 0) {
      result.analysis.legacyTokens = legacyTokens
    }
    return result
  }

  // styled-components with dynamic props
  if (styledComponents.length > 0 && !styledComponents[0].isAutoConvertible) {
    const result = generateStyledComponentMigration(styledComponents[0], context)
    result.warnings = [...(result.warnings || []), ...legacyWarnings]
    if (legacyTokens.length > 0) {
      result.analysis.legacyTokens = legacyTokens
    }
    return result
  }

  // ui-core with dynamic props
  if (uiCoreProps.length > 0 && !uiCoreProps[0].isAutoConvertible) {
    const result = generateUiCoreMigration(uiCoreProps[0], context)
    result.warnings = [...(result.warnings || []), ...legacyWarnings]
    if (legacyTokens.length > 0) {
      result.analysis.legacyTokens = legacyTokens
    }
    return result
  }

  // Default - provide basic migration spec
  return {
    analysis: {
      patternType: legacyTokens.length > 0 ? 'legacy-theme-usage' : 'unknown',
      dynamicDependencies: [],
      conditionalLogic: [],
      legacyTokens: legacyTokens.length > 0 ? legacyTokens : undefined,
    },
    migrationSpec: {
      approach: 'className-only',
      imports: [],
      classNames: [],
      dynamicClasses: [],
    },
    example: legacyTokens.length > 0
      ? `// Legacy tokens detected. Replace with:\n${legacyWarnings.map((w) => `// ${w}`).join('\n')}`
      : '// Could not determine pattern. Please provide more context.',
    warnings: legacyTokens.length > 0
      ? legacyWarnings
      : ['Could not parse the provided code snippet'],
  }
}

function generateStyledComponentMigration(
  pattern: ReturnType<typeof parseStyledComponents>[0],
  context?: string
): MigrationSpec {
  const dynamicDependencies = [...pattern.dynamicProps]
  const conditionalLogic: string[] = []
  const warnings: string[] = []

  // Check for theme references
  if (pattern.themeReferences.length > 0) {
    warnings.push(
      `Theme references found: ${pattern.themeReferences.join(', ')}. Consider using CSS variables or NativeWind theme tokens.`
    )
  }

  // Convert static properties
  const staticClasses: string[] = []
  for (const prop of pattern.cssProperties) {
    if (prop.isStatic) {
      const className = convertProperty(prop.property, prop.value)
      if (className) {
        staticClasses.push(className)
      }
    }
  }

  // Determine approach
  const hasConditionals = pattern.dynamicProps.length > 0
  const approach = hasConditionals ? 'clsx' : 'className-only'

  const imports = hasConditionals ? ['import clsx from "clsx"'] : []

  const elementMap: Record<string, string> = {
    View: 'View',
    Text: 'Text',
    Image: 'Image',
    TouchableOpacity: 'TouchableOpacity',
  }
  const targetElement = elementMap[pattern.baseElement] || 'View'

  const example = hasConditionals
    ? `function ${pattern.componentName}({ ${pattern.dynamicProps.join(', ')}, ...props }) {
  return (
    <${targetElement}
      className={clsx(
        "${staticClasses.join(' ')}",
        // Add conditional classes based on props
        ${pattern.dynamicProps.map((p) => `${p} && "conditional-class"`).join(',\n        ')}
      )}
      {...props}
    />
  )
}`
    : `<${targetElement} className="${staticClasses.join(' ')}">`

  return {
    analysis: {
      patternType: 'styled-component-with-dynamic-props',
      dynamicDependencies,
      conditionalLogic,
    },
    migrationSpec: {
      approach,
      imports,
      classNames: staticClasses,
      dynamicClasses: pattern.dynamicProps,
    },
    example,
    warnings,
  }
}

function generateUiCoreMigration(
  pattern: ReturnType<typeof parseUiCoreProps>[0],
  context?: string
): MigrationSpec {
  const dynamicProps = pattern.props.filter((p) => !p.isStatic)
  const staticProps = pattern.props.filter((p) => p.isStatic)

  const dynamicDependencies = dynamicProps.flatMap((p) => p.dependencies || [])
  const conditionalLogic = dynamicProps.map(
    (p) => `${p.name}: ${String(p.value)}`
  )

  // Convert static properties
  const staticClasses: string[] = []
  for (const prop of staticProps) {
    if (prop.tamaguiToken) {
      const tokenResult = mapToken(prop.tamaguiToken)
      if (tokenResult.tailwindClass) {
        const prefix = getPrefixForProperty(prop.name)
        staticClasses.push(`${prefix}${tokenResult.tailwindClass}`)
        continue
      }
    }
    const className = convertProperty(prop.name, prop.value)
    if (className) {
      staticClasses.push(className)
    }
  }

  const elementMap: Record<string, string> = {
    XStack: 'View',
    YStack: 'View',
    Stack: 'View',
    Typography: 'Text',
  }
  const targetElement = elementMap[pattern.componentType] || 'View'

  const dynamicClassExamples = dynamicProps.map((p) => {
    const prop = p.name
    const value = String(p.value)
    // Check if it's a ternary
    if (value.includes('?') && value.includes(':')) {
      return `// ${prop}: ${value} -> use clsx with ternary`
    }
    return `// ${prop}: dynamic value - keep as style prop`
  })

  const example = `<${targetElement}
  className={clsx(
    "${staticClasses.join(' ')}",
    ${dynamicClassExamples.join('\n    ')}
  )}
  // Keep truly dynamic values as style prop:
  style={{
    ${dynamicProps.map((p) => `// ${p.name}: computed value`).join('\n    ')}
  }}
/>`

  return {
    analysis: {
      patternType: 'ui-core-with-dynamic-props',
      dynamicDependencies,
      conditionalLogic,
    },
    migrationSpec: {
      approach: 'style-prop-hybrid',
      imports: ['import clsx from "clsx"'],
      classNames: staticClasses,
      dynamicClasses: dynamicProps.map((p) => p.name),
      styleOverrides: 'Keep computed values as inline style',
    },
    example,
    warnings: [
      'Dynamic props detected. Use clsx for conditional classes and style prop for computed values.',
    ],
  }
}

function getPrefixForProperty(property: string): string {
  const prefixMap: Record<string, string> = {
    backgroundColor: 'bg-',
    color: 'text-',
    borderColor: 'border-',
    padding: 'p-',
    paddingHorizontal: 'px-',
    paddingVertical: 'py-',
    margin: 'm-',
    marginHorizontal: 'mx-',
    marginVertical: 'my-',
    gap: 'gap-',
    height: 'h-',
    width: 'w-',
  }
  return prefixMap[property] || ''
}
