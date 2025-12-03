import type { UiCorePropsPattern, UiCoreProp } from './types.js'

const UI_CORE_COMPONENTS = [
  'XStack',
  'YStack',
  'Stack',
  'Typography',
  'Image',
  'Button',
]

const JSX_PATTERN = /<(\w+)([^>]*)>/g
const PROP_PATTERN = /(\w+)=(?:\{([^}]+)\}|"([^"]*)"|'([^']*)')/g
const TAMAGUI_TOKEN_PATTERN = /^\$\w+/
const TERNARY_PATTERN = /\?.*:/

export function parseUiCoreProps(sourceCode: string): UiCorePropsPattern[] {
  const patterns: UiCorePropsPattern[] = []

  let match: RegExpExecArray | null
  const jsxRegex = new RegExp(JSX_PATTERN.source, 'g')

  while ((match = jsxRegex.exec(sourceCode)) !== null) {
    const componentType = match[1]

    // Only process ui-core components
    if (!UI_CORE_COMPONENTS.includes(componentType)) continue

    const propsString = match[2]
    const startIndex = match.index
    const lineNumber = sourceCode.substring(0, startIndex).split('\n').length

    const props = parseProps(propsString)

    // Auto-convertible if all props are static
    const isAutoConvertible = props.every((p) => p.isStatic)

    patterns.push({
      componentType,
      props,
      isAutoConvertible,
      sourceLocation: { line: lineNumber, column: 0 },
      rawCode: match[0],
    })
  }

  return patterns
}

function parseProps(propsString: string): UiCoreProp[] {
  const props: UiCoreProp[] = []

  let propMatch: RegExpExecArray | null
  const propRegex = new RegExp(PROP_PATTERN.source, 'g')

  while ((propMatch = propRegex.exec(propsString)) !== null) {
    const name = propMatch[1]
    const jsxValue = propMatch[2] // {value}
    const doubleQuoteValue = propMatch[3] // "value"
    const singleQuoteValue = propMatch[4] // 'value'

    // Skip non-style props
    if (isNonStyleProp(name)) continue

    let value: string | number
    let isStatic = true
    let tamaguiToken: string | undefined
    const dependencies: string[] = []

    if (jsxValue) {
      // Check if it's a number
      if (/^\d+$/.test(jsxValue.trim())) {
        value = parseInt(jsxValue.trim(), 10)
      } else if (/^\d+\.\d+$/.test(jsxValue.trim())) {
        value = parseFloat(jsxValue.trim())
      } else {
        value = jsxValue.trim()

        // Check for ternary or other dynamic expressions
        if (TERNARY_PATTERN.test(value) || /\w+\s*&&/.test(value)) {
          isStatic = false
          // Extract dependencies
          const varMatches = value.match(/\b[a-z]\w*\b/gi) || []
          dependencies.push(
            ...varMatches.filter((v) => !['true', 'false', 'null', 'undefined'].includes(v))
          )
        }

        // Check for Tamagui tokens
        if (TAMAGUI_TOKEN_PATTERN.test(value)) {
          tamaguiToken = value
        }
      }
    } else {
      value = doubleQuoteValue || singleQuoteValue || ''
      if (TAMAGUI_TOKEN_PATTERN.test(value)) {
        tamaguiToken = value
      }
    }

    props.push({
      name,
      value,
      isStatic,
      tamaguiToken,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
    })
  }

  return props
}

function isNonStyleProp(name: string): boolean {
  const nonStyleProps = [
    'children',
    'key',
    'ref',
    'onPress',
    'onLongPress',
    'onLayout',
    'testID',
    'accessibilityLabel',
    'accessibilityHint',
    'accessibilityRole',
    'disabled',
    'source',
    'variant',
    'asChild',
  ]
  return nonStyleProps.includes(name)
}
