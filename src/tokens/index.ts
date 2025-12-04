import type { TokenMappingResult } from '../parsers/types.js'
import {
  mapColorToken,
  mapLegacyColorToken,
  colorMappings,
  getColorTailwindConfig,
  getDesignSystemColorConfig,
  getLegacyColorConfig,
} from './colorMapping.js'
import { mapSpacingToken, mapRadiusToken, pxToTailwind } from './spacingMapping.js'
import {
  mapTypographyToken,
  getFontFamilyTailwindConfig,
  getDesignSystemTypographyVariants,
  getLegacyTypographyVariants,
} from './typographyMapping.js'
import {
  LEGACY_COLORS,
  LEGACY_TYPOGRAPHY,
  LEGACY_COLOR_MIGRATIONS,
  FONT_FAMILY_TAILWIND_MAP,
  LOCALE_FONT_MAP,
  type SupportedLocale,
} from './legacyMapping.js'

export {
  // Color mappings
  mapColorToken,
  mapLegacyColorToken,
  colorMappings,
  getColorTailwindConfig,
  getDesignSystemColorConfig,
  getLegacyColorConfig,
  // Spacing mappings
  mapSpacingToken,
  mapRadiusToken,
  pxToTailwind,
  // Typography mappings
  mapTypographyToken,
  getFontFamilyTailwindConfig,
  getDesignSystemTypographyVariants,
  getLegacyTypographyVariants,
  // Legacy constants
  LEGACY_COLORS,
  LEGACY_TYPOGRAPHY,
  LEGACY_COLOR_MIGRATIONS,
  FONT_FAMILY_TAILWIND_MAP,
  LOCALE_FONT_MAP,
}

export type { SupportedLocale }

export type MapTokenOptions = {
  type?: 'color' | 'spacing' | 'typography' | 'radius' | 'legacy' | 'all'
  locale?: SupportedLocale
}

export function mapToken(
  token: string,
  options?: MapTokenOptions
): TokenMappingResult {
  const { type, locale = 'ko' } = options || {}

  // If type is specified, use that mapper
  if (type && type !== 'all') {
    switch (type) {
      case 'color':
        return mapColorToken(token)
      case 'spacing':
        return mapSpacingToken(token)
      case 'typography':
        return mapTypographyToken(token, { locale })
      case 'radius':
        return mapRadiusToken(token)
      case 'legacy':
        // Try legacy color first, then legacy typography
        const legacyColor = mapLegacyColorToken(token)
        if (legacyColor.tailwindClass) return legacyColor
        return mapTypographyToken(token, { locale }) // Will check legacy typography
    }
  }

  // Auto-detect type based on token pattern

  // Legacy theme references: theme.main.colors.X, theme.fonts.X
  if (token.includes('theme.main.colors.') || token.includes('colors.')) {
    return mapLegacyColorToken(token)
  }

  if (token.includes('theme.fonts.')) {
    return mapTypographyToken(token, { locale })
  }

  // Design system color tokens: $coral100, $gray900, $red400
  if (/^\$[a-z]+\d+$/i.test(token)) {
    const colorResult = mapColorToken(token)
    if (colorResult.tailwindClass) return colorResult

    // Might be spacing token like $16
    const spacingResult = mapSpacingToken(token)
    if (spacingResult.tailwindClass) return spacingResult
  }

  // Pure numeric tokens: $4, $16, $24
  if (/^\$\d+$/.test(token)) {
    return mapSpacingToken(token)
  }

  // Design system typography tokens: $body2R, $headline1B, $display1B
  if (/^\$(display|body|headline|heading|caption|label)\d/i.test(token)) {
    return mapTypographyToken(token, { locale })
  }

  // $full for border radius
  if (token === '$full') {
    return mapRadiusToken(token)
  }

  // Simple color names: $white, $black
  if (/^\$(white|black)$/i.test(token)) {
    return mapColorToken(token)
  }

  // Try legacy color by direct name (mono100, main700, etc.)
  const legacyColorResult = mapLegacyColorToken(token)
  if (legacyColorResult.tailwindClass) {
    return legacyColorResult
  }

  return {
    token,
    tailwindClass: null,
    cssValue: '',
    category: 'unknown',
    isLegacy: false,
    customRequired: false,
    notes: `Could not auto-detect token type for: ${token}`,
  }
}
