import type {
  ConversionResult,
  SkippedConversion,
  StyledComponentPattern,
  TamaguiStyledPattern,
  UiCorePropsPattern,
} from '../parsers/types.js'
import { convertProperty } from './rules.js'
import { mapToken } from '../tokens/index.js'

export type SimpleConversionOutput = {
  conversions: ConversionResult[]
  skipped: SkippedConversion[]
}

export function convertStyledComponent(
  pattern: StyledComponentPattern
): SimpleConversionOutput {
  const conversions: ConversionResult[] = []
  const skipped: SkippedConversion[] = []

  if (!pattern.isAutoConvertible) {
    skipped.push({
      code: pattern.rawCode,
      reason: `Has dynamic props: ${pattern.dynamicProps.join(', ')}`,
      lineNumber: pattern.sourceLocation.line,
      suggestedApproach: pattern.dynamicProps.length > 0
        ? 'Use clsx for conditional classes or style prop for computed values'
        : 'Theme references need CSS variables or context-based styling',
    })
    return { conversions, skipped }
  }

  const classes: string[] = []

  for (const prop of pattern.cssProperties) {
    if (!prop.isStatic) continue

    const className = convertProperty(prop.property, prop.value)
    if (className) {
      classes.push(className)
    }
  }

  if (classes.length > 0) {
    // Determine target element
    const elementMap: Record<string, string> = {
      View: 'View',
      Text: 'Text',
      Image: 'Image',
      TouchableOpacity: 'TouchableOpacity',
      Pressable: 'Pressable',
      ScrollView: 'ScrollView',
    }
    const targetElement = elementMap[pattern.baseElement] || 'View'

    conversions.push({
      original: pattern.rawCode,
      converted: `// Replace ${pattern.componentName} with:\n<${targetElement} className="${classes.join(' ')}">`,
      confidence: 'high',
      lineNumber: pattern.sourceLocation.line,
      type: 'styled-component',
    })
  }

  return { conversions, skipped }
}

export function convertTamaguiStyled(
  pattern: TamaguiStyledPattern
): SimpleConversionOutput {
  const conversions: ConversionResult[] = []
  const skipped: SkippedConversion[] = []

  if (!pattern.isAutoConvertible) {
    skipped.push({
      code: pattern.rawCode,
      reason: `Has variants: ${pattern.variants.map((v) => v.name).join(', ')}`,
      lineNumber: pattern.sourceLocation.line,
      suggestedApproach: 'Use cva (class-variance-authority) for variant-based styling',
    })
    return { conversions, skipped }
  }

  const classes: string[] = []

  for (const [prop, value] of Object.entries(pattern.staticStyles)) {
    // Check if value is a Tamagui token
    if (typeof value === 'string' && value.startsWith('$')) {
      const tokenResult = mapToken(value)
      if (tokenResult.tailwindClass) {
        // Determine prefix based on property
        const prefix = getPrefixForProperty(prop)
        if (prefix) {
          classes.push(`${prefix}${tokenResult.tailwindClass}`)
        }
        continue
      }
    }

    const className = convertProperty(prop, value)
    if (className) {
      classes.push(className)
    }
  }

  if (classes.length > 0) {
    const targetElement = getTargetElement(pattern.baseComponent)

    conversions.push({
      original: pattern.rawCode,
      converted: `// Replace ${pattern.componentName} with:\n<${targetElement} className="${classes.join(' ')}">`,
      confidence: 'high',
      lineNumber: pattern.sourceLocation.line,
      type: 'tamagui',
    })
  }

  return { conversions, skipped }
}

export function convertUiCoreProps(
  pattern: UiCorePropsPattern
): SimpleConversionOutput {
  const conversions: ConversionResult[] = []
  const skipped: SkippedConversion[] = []

  // Separate static vs dynamic style props
  const staticProps = pattern.props.filter((p) => p.isStatic)
  const dynamicStyleProps = pattern.props.filter((p) => !p.isStatic)

  // Build className from static props
  const classes: string[] = []

  for (const prop of staticProps) {
    // Handle Tamagui tokens
    if (prop.tamaguiToken) {
      const tokenResult = mapToken(prop.tamaguiToken)
      if (tokenResult.tailwindClass) {
        const prefix = getPrefixForProperty(prop.name)
        if (prefix) {
          classes.push(`${prefix}${tokenResult.tailwindClass}`)
        }
        continue
      }
    }

    const className = convertProperty(prop.name, prop.value)
    if (className) {
      classes.push(className)
    }
  }

  // Build style object from dynamic props
  const styleEntries = dynamicStyleProps.map((p) => `${p.name}: ${p.value}`)

  // Check if there's an existing style prop to merge with
  const existingStyleProp = pattern.passthroughProps.find((p) => p.name === 'style')
  const otherPassthroughProps = pattern.passthroughProps.filter((p) => p.name !== 'style')

  // Build style attribute
  let styleAttr = ''
  if (styleEntries.length > 0 && existingStyleProp) {
    // Merge dynamic styles with existing style prop using array syntax
    styleAttr = ` style={[{ ${styleEntries.join(', ')} }, ${existingStyleProp.rawValue}]}`
  } else if (styleEntries.length > 0) {
    styleAttr = ` style={{ ${styleEntries.join(', ')} }}`
  } else if (existingStyleProp) {
    styleAttr = ` style={${existingStyleProp.rawValue}}`
  }

  // Build passthrough props string (excluding style which is handled above)
  const passthroughStr = otherPassthroughProps
    .map((p) => `${p.name}={${p.rawValue}}`)
    .join(' ')

  const targetElement = getTargetElement(pattern.componentType)

  // Generate output even if there are dynamic props (we handle them in style)
  const classAttr = classes.length > 0 ? `className="${classes.join(' ')}"` : ''
  const allAttrs = [classAttr, styleAttr.trim(), passthroughStr].filter(Boolean).join(' ')

  conversions.push({
    original: pattern.rawCode,
    converted: `<${targetElement} ${allAttrs}>`,
    confidence: dynamicStyleProps.length > 0 ? 'medium' : 'high',
    lineNumber: pattern.sourceLocation.line,
    type: 'ui-core',
  })

  return { conversions, skipped }
}

function getPrefixForProperty(property: string): string {
  const prefixMap: Record<string, string> = {
    backgroundColor: 'bg-',
    color: 'text-',
    borderColor: 'border-',
    padding: 'p-',
    paddingHorizontal: 'px-',
    paddingVertical: 'py-',
    paddingTop: 'pt-',
    paddingBottom: 'pb-',
    paddingLeft: 'pl-',
    paddingRight: 'pr-',
    margin: 'm-',
    marginHorizontal: 'mx-',
    marginVertical: 'my-',
    marginTop: 'mt-',
    marginBottom: 'mb-',
    marginLeft: 'ml-',
    marginRight: 'mr-',
    gap: 'gap-',
    rowGap: 'gap-y-',
    columnGap: 'gap-x-',
    width: 'w-',
    height: 'h-',
    borderRadius: 'rounded-',
  }
  return prefixMap[property] || ''
}

function getTargetElement(component: string): string {
  const elementMap: Record<string, string> = {
    XStack: 'View',
    YStack: 'View',
    Stack: 'View',
    Typography: 'Text',
    Image: 'Image',
    Button: 'TouchableOpacity',
  }
  return elementMap[component] || 'View'
}
