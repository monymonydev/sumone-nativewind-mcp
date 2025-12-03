import { color } from '@monymony-public/ui-theme'
import type { TokenMappingResult } from '../parsers/types.js'

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

export function mapColorToken(token: string): TokenMappingResult {
  const entry = colorMappings.get(token)

  if (entry) {
    return {
      token,
      tailwindClass: entry.tailwindClass,
      cssValue: entry.hex,
      category: 'color',
      customRequired: true, // Colors need to be added to tailwind.config.js
    }
  }

  return {
    token,
    tailwindClass: null,
    cssValue: '',
    category: 'unknown',
    customRequired: false,
    notes: `Unknown color token: ${token}`,
  }
}

export function getColorTailwindConfig(): Record<string, Record<string, string>> {
  const config: Record<string, Record<string, string>> = {}

  for (const [colorName, shades] of Object.entries(color)) {
    if (typeof shades === 'string') {
      // white, black
      config[colorName] = { DEFAULT: shades }
    } else {
      config[colorName] = {}
      for (const [shade, hex] of Object.entries(shades)) {
        config[colorName][shade] = hex
      }
    }
  }

  return config
}
