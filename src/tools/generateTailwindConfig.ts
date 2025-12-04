import {
  getColorTailwindConfig,
  getFontFamilyTailwindConfig,
} from '../tokens/index.js'
import type { SupportedLocale } from '../tokens/legacyMapping.js'

export type GenerateTailwindConfigInput = {
  includeLegacy?: boolean
  locale?: SupportedLocale
}

export type TailwindConfigOutput = {
  config: {
    theme: {
      extend: {
        colors: Record<string, unknown>
        fontFamily: Record<string, string[]>
      }
    }
  }
  configString: string
}

/**
 * Generate a complete Tailwind config with design system and legacy tokens
 */
export function generateTailwindConfig(
  input: GenerateTailwindConfigInput
): TailwindConfigOutput {
  const { includeLegacy = true } = input

  const { designSystem, legacy } = getColorTailwindConfig({ includeLegacy })
  const fontFamily = getFontFamilyTailwindConfig()

  // Merge colors
  const colors: Record<string, unknown> = { ...designSystem }

  if (includeLegacy) {
    // Add legacy colors as flat keys
    for (const [key, value] of Object.entries(legacy)) {
      colors[key] = value
    }
  }

  const config = {
    theme: {
      extend: {
        colors,
        fontFamily,
      },
    },
  }

  // Generate config string with proper formatting
  const configString = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 8).replace(/^/gm, '      ').trim()},
      fontFamily: ${JSON.stringify(fontFamily, null, 8).replace(/^/gm, '      ').trim()},
    },
  },
  plugins: [],
}`

  return { config, configString }
}

/**
 * Generate just the colors portion of the Tailwind config
 */
export function generateColorConfig(input: { includeLegacy?: boolean }): {
  designSystem: Record<string, unknown>
  legacy: Record<string, string>
  merged: Record<string, unknown>
} {
  const { designSystem, legacy } = getColorTailwindConfig({
    includeLegacy: input.includeLegacy,
  })

  const merged: Record<string, unknown> = { ...designSystem }
  for (const [key, value] of Object.entries(legacy)) {
    merged[key] = value
  }

  return { designSystem, legacy, merged }
}

/**
 * Generate just the fontFamily portion of the Tailwind config
 */
export function generateFontConfig(): Record<string, string[]> {
  return getFontFamilyTailwindConfig()
}
