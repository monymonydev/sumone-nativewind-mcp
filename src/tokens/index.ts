import type { TokenMappingResult } from '../parsers/types.js'
import { mapColorToken, colorMappings, getColorTailwindConfig } from './colorMapping.js'
import { mapSpacingToken, mapRadiusToken, pxToTailwind } from './spacingMapping.js'
import { mapTypographyToken, getFontFamilyTailwindConfig } from './typographyMapping.js'

export {
  mapColorToken,
  colorMappings,
  getColorTailwindConfig,
  mapSpacingToken,
  mapRadiusToken,
  pxToTailwind,
  mapTypographyToken,
  getFontFamilyTailwindConfig,
}

export function mapToken(
  token: string,
  type?: 'color' | 'spacing' | 'typography' | 'radius' | 'all'
): TokenMappingResult {
  // If type is specified, use that mapper
  if (type && type !== 'all') {
    switch (type) {
      case 'color':
        return mapColorToken(token)
      case 'spacing':
        return mapSpacingToken(token)
      case 'typography':
        return mapTypographyToken(token)
      case 'radius':
        return mapRadiusToken(token)
    }
  }

  // Auto-detect type based on token pattern
  // Color tokens: $coral100, $gray900, $red400
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

  // Typography tokens: $body2R, $headline1B
  if (/^\$(body|headline|heading|caption|badge|title)\d/i.test(token)) {
    return mapTypographyToken(token)
  }

  // $full for border radius
  if (token === '$full') {
    return mapRadiusToken(token)
  }

  // Simple color names: $white, $black
  if (/^\$(white|black)$/i.test(token)) {
    return mapColorToken(token)
  }

  return {
    token,
    tailwindClass: null,
    cssValue: '',
    category: 'unknown',
    customRequired: false,
    notes: `Could not auto-detect token type for: ${token}`,
  }
}
