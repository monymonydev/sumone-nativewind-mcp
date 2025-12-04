import { color } from '@monymony-public/ui-theme'
import type { TokenMappingResult } from '../parsers/types.js'
import {
  LEGACY_COLORS,
  LEGACY_COLOR_MIGRATIONS,
  type LegacyColorKey,
} from './legacyMapping.js'

export type ColorTokenEntry = {
  tamaguiToken: string
  tailwindClass: string
  hex: string
}

function buildColorTokenMappings(): Map<string, ColorTokenEntry> {
  const mappings = new Map<string, ColorTokenEntry>()

  for (const [colorName, shades] of Object.entries(color)) {
    if (typeof shades === 'string') {
      // white, black - no shades
      const tamaguiToken = `$${colorName}`
      mappings.set(tamaguiToken, {
        tamaguiToken,
        tailwindClass: colorName,
        hex: shades.toLowerCase(),
      })
    } else {
      // Colors with shades (coral, gray, red, etc.)
      for (const [shade, hex] of Object.entries(shades)) {
        // Tamagui format: $coral100, $gray900
        const tamaguiToken = `$${colorName}${shade}`
        // Tailwind format: coral-100, gray-900
        const tailwindClass = `${colorName}-${shade}`

        mappings.set(tamaguiToken, {
          tamaguiToken,
          tailwindClass,
          hex: hex.toLowerCase(),
        })
      }
    }
  }

  return mappings
}

export const colorMappings = buildColorTokenMappings()

/**
 * Map a design system color token to Tailwind class
 * Supports formats: $coral500, $gray100, $white, $black
 */
export function mapColorToken(token: string): TokenMappingResult {
  const entry = colorMappings.get(token)

  if (entry) {
    return {
      token,
      tailwindClass: entry.tailwindClass,
      cssValue: entry.hex,
      category: 'color',
      isLegacy: false,
      customRequired: true, // Colors need to be added to tailwind.config.js
    }
  }

  return {
    token,
    tailwindClass: null,
    cssValue: '',
    category: 'unknown',
    isLegacy: false,
    customRequired: false,
    notes: `Unknown color token: ${token}`,
  }
}

/**
 * Convert legacy color key to Tailwind class name
 * e.g., mono100 → legacy-mono-100, main700 → legacy-main-700
 */
function legacyKeyToTailwindClass(key: string): string {
  // Insert hyphen before numbers: mono100 → mono-100
  const withHyphen = key.replace(/(\d+)/, '-$1')
  return `legacy-${withHyphen}`
}

/**
 * Extract legacy color key from various formats
 * Supports:
 * - theme.main.colors.mono100
 * - ${({theme}) => theme.main.colors.mono100}
 * - colors.mono100
 */
function extractLegacyColorKey(token: string): string | null {
  // Match patterns like colors.mono100 or main.colors.mono100
  const match = token.match(/colors\.(\w+)/)
  return match ? match[1] : null
}

/**
 * Map a legacy color token to Tailwind class with legacy- prefix
 * Supports formats from styled-components theme references
 */
export function mapLegacyColorToken(token: string): TokenMappingResult & {
  suggestedMigration?: string
} {
  const colorKey = extractLegacyColorKey(token)

  if (colorKey && colorKey in LEGACY_COLORS) {
    const hex = LEGACY_COLORS[colorKey as LegacyColorKey]
    const tailwindClass = legacyKeyToTailwindClass(colorKey)
    const suggestedMigration = LEGACY_COLOR_MIGRATIONS[colorKey as LegacyColorKey]

    return {
      token,
      tailwindClass,
      cssValue: hex,
      category: 'legacy-color',
      isLegacy: true,
      customRequired: true,
      suggestedMigration,
      notes: suggestedMigration
        ? `Legacy token. Consider migrating to: ${suggestedMigration}`
        : 'Legacy token. No direct design system equivalent.',
    }
  }

  // Try direct key match (e.g., just "mono100")
  if (token in LEGACY_COLORS) {
    const hex = LEGACY_COLORS[token as LegacyColorKey]
    const tailwindClass = legacyKeyToTailwindClass(token)
    const suggestedMigration = LEGACY_COLOR_MIGRATIONS[token as LegacyColorKey]

    return {
      token,
      tailwindClass,
      cssValue: hex,
      category: 'legacy-color',
      isLegacy: true,
      customRequired: true,
      suggestedMigration,
      notes: suggestedMigration
        ? `Legacy token. Consider migrating to: ${suggestedMigration}`
        : 'Legacy token. No direct design system equivalent.',
    }
  }

  return {
    token,
    tailwindClass: null,
    cssValue: '',
    category: 'unknown',
    isLegacy: false,
    customRequired: false,
    notes: `Unknown legacy color token: ${token}`,
  }
}

/**
 * Generate Tailwind config for design system colors
 */
export function getDesignSystemColorConfig(): Record<
  string,
  Record<string, string> | string
> {
  const config: Record<string, Record<string, string> | string> = {}

  for (const [colorName, shades] of Object.entries(color)) {
    if (typeof shades === 'string') {
      // white, black
      config[colorName] = shades
    } else {
      config[colorName] = {}
      for (const [shade, hex] of Object.entries(shades)) {
        ;(config[colorName] as Record<string, string>)[shade] = hex
      }
    }
  }

  return config
}

/**
 * Generate Tailwind config for legacy colors
 */
export function getLegacyColorConfig(): Record<string, string> {
  const config: Record<string, string> = {}

  for (const [key, hex] of Object.entries(LEGACY_COLORS)) {
    const tailwindKey = legacyKeyToTailwindClass(key)
    config[tailwindKey] = hex
  }

  return config
}

/**
 * Generate complete Tailwind color config (design system + legacy)
 */
export function getColorTailwindConfig(options?: { includeLegacy?: boolean }): {
  designSystem: Record<string, Record<string, string> | string>
  legacy: Record<string, string>
} {
  const designSystem = getDesignSystemColorConfig()
  const legacy = options?.includeLegacy !== false ? getLegacyColorConfig() : {}

  return { designSystem, legacy }
}
