import type { TokenMappingResult } from '../parsers/types.js'

// Tamagui spacing tokens map to Tailwind spacing scale
// Tamagui uses pixel values, Tailwind uses 0.25rem increments (4px at default)
// $4 = 4px = Tailwind 1, $8 = 8px = Tailwind 2, etc.

const SPACING_MAP: Record<string, { tailwind: string; px: number }> = {
  '$0': { tailwind: '0', px: 0 },
  '$1': { tailwind: 'px', px: 1 },
  '$2': { tailwind: '0.5', px: 2 },
  '$4': { tailwind: '1', px: 4 },
  '$6': { tailwind: '1.5', px: 6 },
  '$8': { tailwind: '2', px: 8 },
  '$10': { tailwind: '2.5', px: 10 },
  '$12': { tailwind: '3', px: 12 },
  '$14': { tailwind: '3.5', px: 14 },
  '$16': { tailwind: '4', px: 16 },
  '$18': { tailwind: '[18px]', px: 18 },
  '$20': { tailwind: '5', px: 20 },
  '$24': { tailwind: '6', px: 24 },
  '$28': { tailwind: '7', px: 28 },
  '$32': { tailwind: '8', px: 32 },
  '$36': { tailwind: '9', px: 36 },
  '$40': { tailwind: '10', px: 40 },
  '$44': { tailwind: '11', px: 44 },
  '$48': { tailwind: '12', px: 48 },
  '$56': { tailwind: '14', px: 56 },
  '$64': { tailwind: '16', px: 64 },
  '$72': { tailwind: '[72px]', px: 72 },
  '$80': { tailwind: '20', px: 80 },
  '$96': { tailwind: '24', px: 96 },
}

// Border radius tokens
const RADIUS_MAP: Record<string, { tailwind: string; px: number }> = {
  '$0': { tailwind: 'none', px: 0 },
  '$2': { tailwind: 'sm', px: 2 },
  '$4': { tailwind: '', px: 4 }, // Default rounded
  '$6': { tailwind: 'md', px: 6 },
  '$8': { tailwind: 'lg', px: 8 },
  '$12': { tailwind: 'xl', px: 12 },
  '$16': { tailwind: '2xl', px: 16 },
  '$24': { tailwind: '3xl', px: 24 },
  '$full': { tailwind: 'full', px: 9999 },
}

export function mapSpacingToken(token: string): TokenMappingResult {
  const entry = SPACING_MAP[token]

  if (entry) {
    return {
      token,
      tailwindClass: entry.tailwind,
      cssValue: `${entry.px}px`,
      category: 'spacing',
      customRequired: entry.tailwind.startsWith('['),
    }
  }

  // Try to parse numeric token
  const numMatch = token.match(/^\$(\d+)$/)
  if (numMatch) {
    const px = parseInt(numMatch[1], 10)
    const tailwind = pxToTailwind(px)
    return {
      token,
      tailwindClass: tailwind,
      cssValue: `${px}px`,
      category: 'spacing',
      customRequired: tailwind.startsWith('['),
    }
  }

  return {
    token,
    tailwindClass: null,
    cssValue: '',
    category: 'unknown',
    customRequired: false,
    notes: `Unknown spacing token: ${token}`,
  }
}

export function mapRadiusToken(token: string): TokenMappingResult {
  const entry = RADIUS_MAP[token]

  if (entry) {
    return {
      token,
      tailwindClass: entry.tailwind,
      cssValue: entry.px === 9999 ? '9999px' : `${entry.px}px`,
      category: 'radius',
      customRequired: false,
    }
  }

  return {
    token,
    tailwindClass: null,
    cssValue: '',
    category: 'unknown',
    customRequired: false,
    notes: `Unknown radius token: ${token}`,
  }
}

export function pxToTailwind(px: number): string {
  // Standard Tailwind spacing scale
  const scale: Record<number, string> = {
    0: '0',
    1: 'px',
    2: '0.5',
    4: '1',
    6: '1.5',
    8: '2',
    10: '2.5',
    12: '3',
    14: '3.5',
    16: '4',
    20: '5',
    24: '6',
    28: '7',
    32: '8',
    36: '9',
    40: '10',
    44: '11',
    48: '12',
    56: '14',
    64: '16',
    80: '20',
    96: '24',
  }

  return scale[px] ?? `[${px}px]`
}

export function numericValueToTailwind(value: number): string {
  return pxToTailwind(value)
}
