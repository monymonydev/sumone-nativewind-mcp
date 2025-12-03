import type { TamaguiStyledPattern, MigrationSpec } from '../parsers/types.js'
import { convertProperty } from './rules.js'
import { mapToken } from '../tokens/index.js'

export function generateCvaConfig(pattern: TamaguiStyledPattern): MigrationSpec {
  const staticClasses: string[] = []
  const dynamicDependencies: string[] = []
  const conditionalLogic: string[] = []
  const warnings: string[] = []

  // Convert static styles to base classes
  for (const [prop, value] of Object.entries(pattern.staticStyles)) {
    if (typeof value === 'string' && value.startsWith('$')) {
      const tokenResult = mapToken(value)
      if (tokenResult.tailwindClass) {
        const prefix = getPrefixForProperty(prop)
        if (prefix) {
          staticClasses.push(`${prefix}${tokenResult.tailwindClass}`)
        }
      }
    } else {
      const className = convertProperty(prop, value)
      if (className) {
        staticClasses.push(className)
      }
    }
  }

  // Process variants
  const variantsConfig: Record<string, Record<string, string>> = {}

  for (const variant of pattern.variants) {
    if (variant.isDynamic) {
      warnings.push(
        `Variant "${variant.name}" is dynamic (function-based). Manual conversion required.`
      )
      dynamicDependencies.push(variant.name)
      continue
    }

    variantsConfig[variant.name] = {}

    for (const variantValue of variant.values) {
      const classes: string[] = []

      for (const [prop, value] of Object.entries(variantValue.styles)) {
        if (typeof value === 'string' && value.startsWith('$')) {
          const tokenResult = mapToken(value)
          if (tokenResult.tailwindClass) {
            const prefix = getPrefixForProperty(prop)
            if (prefix) {
              classes.push(`${prefix}${tokenResult.tailwindClass}`)
            }
          }
        } else {
          const className = convertProperty(prop, value)
          if (className) {
            classes.push(className)
          }
        }
      }

      variantsConfig[variant.name][variantValue.name] = classes.join(' ')
      conditionalLogic.push(`${variant.name}=${variantValue.name}`)
    }
  }

  // Generate cva config string
  const cvaConfig = generateCvaString(staticClasses, variantsConfig)

  // Generate example usage
  const targetElement = getTargetElement(pattern.baseComponent)
  const example = generateExample(pattern.componentName, targetElement, pattern.variants)

  return {
    analysis: {
      patternType: 'tamagui-styled-with-variants',
      dynamicDependencies,
      conditionalLogic,
    },
    migrationSpec: {
      approach: 'cva',
      imports: ['import { cva, type VariantProps } from "class-variance-authority"'],
      classNames: staticClasses,
      dynamicClasses: Object.keys(variantsConfig),
      cvaConfig,
    },
    example,
    warnings,
  }
}

function generateCvaString(
  baseClasses: string[],
  variants: Record<string, Record<string, string>>
): string {
  const lines: string[] = [
    `const ${getVariableName()}Variants = cva(`,
    `  "${baseClasses.join(' ')}",`,
    `  {`,
    `    variants: {`,
  ]

  for (const [variantName, values] of Object.entries(variants)) {
    lines.push(`      ${variantName}: {`)
    for (const [valueName, classes] of Object.entries(values)) {
      lines.push(`        ${valueName}: "${classes}",`)
    }
    lines.push(`      },`)
  }

  lines.push(`    },`)
  lines.push(`  }`)
  lines.push(`)`)

  return lines.join('\n')
}

function generateExample(
  componentName: string,
  targetElement: string,
  variants: TamaguiStyledPattern['variants']
): string {
  const variantProps = variants
    .map((v) => (v.values.length > 0 ? `${v.name}="${v.values[0].name}"` : ''))
    .filter(Boolean)
    .join(' ')

  const propsType = variants.length > 0
    ? `type ${componentName}Props = VariantProps<typeof ${getVariableName()}Variants> & { children?: React.ReactNode }`
    : ''

  return `${propsType ? propsType + '\n\n' : ''}function ${componentName}({ ${variants.map((v) => v.name).join(', ')}, children, ...props }) {
  return (
    <${targetElement}
      className={${getVariableName()}Variants({ ${variants.map((v) => v.name).join(', ')} })}
      {...props}
    >
      {children}
    </${targetElement}>
  )
}`
}

function getVariableName(): string {
  return 'component' // This would be dynamically set in real usage
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
    height: 'h-',
    width: 'w-',
    borderRadius: 'rounded-',
    gap: 'gap-',
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
