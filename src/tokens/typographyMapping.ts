import { typography, fontFamily } from '@monymony-public/ui-theme'
import type { TokenMappingResult } from '../parsers/types.js'
import {
  LEGACY_TYPOGRAPHY,
  FONT_FAMILY_TAILWIND_MAP,
  LOCALE_FONT_MAP,
  type LegacyTypographyKey,
  type SupportedLocale,
} from './legacyMapping.js'

// Design system typography variants from @monymony-public/ui-theme
const DESIGN_SYSTEM_VARIANTS = [
  'display1B',
  'display1R',
  'display2B',
  'display2R',
  'heading1B',
  'heading1R',
  'heading2B',
  'heading2R',
  'heading3B',
  'heading3R',
  'headline1B',
  'headline1R',
  'headline2B',
  'headline2R',
  'headline3B',
  'headline3R',
  'body1B',
  'body1R',
  'body2B',
  'body2R',
  'body3B',
  'body3R',
  'label1B',
  'label1R',
  'label2B',
  'label2R',
  'caption1R',
  'caption2R',
] as const

type DesignSystemVariant = (typeof DESIGN_SYSTEM_VARIANTS)[number]

function isDesignSystemVariant(value: string): value is DesignSystemVariant {
  return DESIGN_SYSTEM_VARIANTS.includes(value as DesignSystemVariant)
}

/**
 * Build Tailwind classes for a typography definition
 */
function buildTypographyClasses(def: {
  fontFamily: string
  fontSize: number
  lineHeight?: number
  letterSpacing?: number
}): string {
  const classes: string[] = []

  // Font family
  const fontClass = FONT_FAMILY_TAILWIND_MAP[def.fontFamily]
  if (fontClass) {
    classes.push(fontClass)
  } else {
    // Fallback to arbitrary value
    classes.push(`font-['${def.fontFamily.replace(/\s+/g, '_')}']`)
  }

  // Font size
  classes.push(`text-[${def.fontSize}px]`)

  // Line height
  if (def.lineHeight) {
    classes.push(`leading-[${def.lineHeight}px]`)
  }

  // Letter spacing
  if (def.letterSpacing) {
    classes.push(`tracking-[${def.letterSpacing}px]`)
  }

  return classes.join(' ')
}

/**
 * Build Tailwind classes for design system typography with locale awareness
 */
function buildDesignSystemTypographyClasses(
  variant: DesignSystemVariant,
  locale: SupportedLocale
): string | null {
  const localeTypography = typography[locale as keyof typeof typography]
  if (!localeTypography) return null

  const def = localeTypography[variant as keyof typeof localeTypography]
  if (!def) return null

  const classes: string[] = []

  // Determine if bold based on variant suffix
  const isBold = variant.endsWith('B')
  const localeFont = LOCALE_FONT_MAP[locale]

  if (localeFont) {
    const fontFamilyKey = isBold ? localeFont.bold : localeFont.regular
    const fontClass = FONT_FAMILY_TAILWIND_MAP[fontFamilyKey]
    if (fontClass) {
      classes.push(fontClass)
    }
  }

  // Font size
  classes.push(`text-[${def.fontSize}px]`)

  // Line height
  if (def.lineHeight) {
    classes.push(`leading-[${def.lineHeight}px]`)
  }

  return classes.join(' ')
}

export type TypographyMappingResult = TokenMappingResult & {
  splitUtilities?: string[]
  locale?: string
}

/**
 * Map a typography token to Tailwind classes
 * Supports both design system tokens ($body1R) and legacy tokens (theme.fonts.heading1)
 */
export function mapTypographyToken(
  token: string,
  options?: { locale?: SupportedLocale }
): TypographyMappingResult {
  const locale = options?.locale || 'ko'

  // Clean token: remove $ prefix, theme.fonts. prefix
  const cleanToken = token.replace(/^\$/, '').replace(/^theme\.fonts\./, '')

  // Check design system first
  if (isDesignSystemVariant(cleanToken)) {
    const tailwindClass = buildDesignSystemTypographyClasses(cleanToken, locale)

    if (tailwindClass) {
      const localeTypo = typography[locale as keyof typeof typography]
      const def = localeTypo?.[cleanToken as keyof typeof localeTypo]
      return {
        token,
        tailwindClass,
        cssValue: def
          ? `font-family: ${def.fontFamily}; font-size: ${def.fontSize}px; line-height: ${def.lineHeight}px;`
          : '',
        category: 'typography',
        isLegacy: false,
        customRequired: true,
        locale,
        splitUtilities: tailwindClass.split(' '),
      }
    }
  }

  // Check legacy typography
  if (cleanToken in LEGACY_TYPOGRAPHY) {
    const def = LEGACY_TYPOGRAPHY[cleanToken as LegacyTypographyKey]
    const tailwindClass = buildTypographyClasses(def)

    return {
      token,
      tailwindClass,
      cssValue: `font-family: ${def.fontFamily}; font-size: ${def.fontSize}px; line-height: ${def.lineHeight}px;`,
      category: 'legacy-typography',
      isLegacy: true,
      customRequired: true,
      splitUtilities: tailwindClass.split(' '),
      notes:
        'Legacy typography from sumone-mobile. Consider migrating to design system variant.',
    }
  }

  return {
    token,
    tailwindClass: null,
    cssValue: '',
    category: 'unknown',
    isLegacy: false,
    customRequired: false,
    notes: `Unknown typography token: ${token}`,
  }
}

/**
 * Generate Tailwind fontFamily config for all locales
 */
export function getFontFamilyTailwindConfig(): Record<string, string[]> {
  const config: Record<string, string[]> = {}

  // Per-locale body fonts
  for (const [locale, fonts] of Object.entries(LOCALE_FONT_MAP)) {
    config[`body-${locale}`] = [fonts.regular, 'serif']
    config[`body-${locale}-bold`] = [fonts.bold, 'serif']
  }

  // Common fonts
  config['marker'] = ['MarkMyWords', 'sans-serif']
  config['kotra'] = ['KOTRAHOPE', 'sans-serif']
  config['nanum'] = ['NanumJungHagSaeng', 'sans-serif']

  return config
}

/**
 * Get list of all design system typography variants
 */
export function getDesignSystemTypographyVariants(): readonly string[] {
  return DESIGN_SYSTEM_VARIANTS
}

/**
 * Get list of all legacy typography variants
 */
export function getLegacyTypographyVariants(): string[] {
  return Object.keys(LEGACY_TYPOGRAPHY)
}
