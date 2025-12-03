export type SourceLocation = {
  line: number
  column: number
}

export type CSSProperty = {
  property: string
  value: string
  isStatic: boolean
  dependencies?: string[]
}

export type StyledComponentPattern = {
  componentName: string
  baseElement: string
  cssProperties: CSSProperty[]
  dynamicProps: string[]
  themeReferences: string[]
  isAutoConvertible: boolean
  sourceLocation: SourceLocation
  rawCode: string
}

export type TamaguiVariantValue = {
  name: string
  styles: Record<string, string | number>
}

export type TamaguiVariant = {
  name: string
  values: TamaguiVariantValue[]
  isDynamic: boolean
}

export type TamaguiStyledPattern = {
  componentName: string
  baseComponent: string
  staticStyles: Record<string, string | number>
  variants: TamaguiVariant[]
  isAutoConvertible: boolean
  sourceLocation: SourceLocation
  rawCode: string
}

export type UiCoreProp = {
  name: string
  value: string | number
  isStatic: boolean
  tamaguiToken?: string
  dependencies?: string[]
}

export type UiCorePropsPattern = {
  componentType: string
  props: UiCoreProp[]
  isAutoConvertible: boolean
  sourceLocation: SourceLocation
  rawCode: string
}

export type AnalysisResult = {
  file: string
  patterns: {
    styledComponents: StyledComponentPattern[]
    tamaguiStyled: TamaguiStyledPattern[]
    uiCoreProps: UiCorePropsPattern[]
  }
  summary: {
    totalPatterns: number
    autoConvertible: number
    aiAssisted: number
    manualRequired: number
  }
  tokens: string[]
}

export type ConversionResult = {
  original: string
  converted: string
  confidence: 'high' | 'medium' | 'low'
  lineNumber: number
  type: 'styled-component' | 'tamagui' | 'ui-core'
}

export type SkippedConversion = {
  code: string
  reason: string
  lineNumber: number
  suggestedApproach: string
}

export type TokenMappingResult = {
  token: string
  tailwindClass: string | null
  cssValue: string
  category: 'color' | 'spacing' | 'typography' | 'radius' | 'unknown'
  customRequired: boolean
  notes?: string
}

export type MigrationSpec = {
  analysis: {
    patternType: string
    dynamicDependencies: string[]
    conditionalLogic: string[]
  }
  migrationSpec: {
    approach: 'className-only' | 'cva' | 'clsx' | 'style-prop-hybrid'
    imports: string[]
    classNames: string[]
    dynamicClasses: string[]
    styleOverrides?: string
    cvaConfig?: string
  }
  example: string
  warnings: string[]
}
