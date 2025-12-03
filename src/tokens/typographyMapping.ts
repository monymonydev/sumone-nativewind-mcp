import type { TokenMappingResult } from '../parsers/types.js'

// Typography tokens split into individual Tailwind utilities
// Based on sumone-mobile typography patterns

type TypographyDefinition = {
  fontFamily: string
  fontSize: number
  lineHeight?: number
  fontWeight?: string
  letterSpacing?: number
}

const TYPOGRAPHY_MAP: Record<string, TypographyDefinition> = {
  // Headings
  '$headline1B': {
    fontFamily: 'Pretendard-Bold',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 'bold',
  },
  '$headline2B': {
    fontFamily: 'Pretendard-Bold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
  },
  '$headline3B': {
    fontFamily: 'Pretendard-Bold',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 'bold',
  },
  '$heading1B': {
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 'bold',
  },
  '$heading2B': {
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: 'bold',
  },
  '$heading3B': {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'bold',
  },

  // Body
  '$body1R': {
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  '$body1M': {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    lineHeight: 24,
  },
  '$body2R': {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  '$body2M': {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    lineHeight: 24,
  },
  '$body3R': {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  '$body3M': {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 22,
  },

  // Captions/Badges
  '$caption1R': {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  '$caption2R': {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  '$badge1': {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  '$badge2': {
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
    lineHeight: 14,
  },
  '$badge3': {
    fontFamily: 'Pretendard-Medium',
    fontSize: 10,
    lineHeight: 14,
  },

  // Titles
  '$title1Bold': {
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: 'bold',
  },
  '$title2Bold': {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'bold',
  },
}

const FONT_FAMILY_MAP: Record<string, string> = {
  'Pretendard-Regular': 'font-pretendard',
  'Pretendard-Medium': 'font-pretendard-medium',
  'Pretendard-Bold': 'font-pretendard-bold',
  'Pretendard-SemiBold': 'font-pretendard-semibold',
  'GyeonggiBatangBOTF': 'font-gyeonggi',
}

export function mapTypographyToken(token: string): TokenMappingResult & {
  splitUtilities?: string[]
} {
  const entry = TYPOGRAPHY_MAP[token]

  if (entry) {
    const utilities: string[] = []

    // Font family
    const fontClass = FONT_FAMILY_MAP[entry.fontFamily] || `font-[${entry.fontFamily}]`
    utilities.push(fontClass)

    // Font size
    utilities.push(`text-[${entry.fontSize}px]`)

    // Line height
    if (entry.lineHeight) {
      utilities.push(`leading-[${entry.lineHeight}px]`)
    }

    // Font weight (if not already in font family)
    if (entry.fontWeight === 'bold' && !entry.fontFamily.includes('Bold')) {
      utilities.push('font-bold')
    }

    return {
      token,
      tailwindClass: utilities.join(' '),
      cssValue: `font-family: ${entry.fontFamily}; font-size: ${entry.fontSize}px;`,
      category: 'typography',
      customRequired: true, // Font families need to be configured
      splitUtilities: utilities,
    }
  }

  return {
    token,
    tailwindClass: null,
    cssValue: '',
    category: 'unknown',
    customRequired: false,
    notes: `Unknown typography token: ${token}`,
  }
}

export function getFontFamilyTailwindConfig(): Record<string, string[]> {
  return {
    pretendard: ['Pretendard-Regular', 'sans-serif'],
    'pretendard-medium': ['Pretendard-Medium', 'sans-serif'],
    'pretendard-bold': ['Pretendard-Bold', 'sans-serif'],
    'pretendard-semibold': ['Pretendard-SemiBold', 'sans-serif'],
    gyeonggi: ['GyeonggiBatangBOTF', 'serif'],
  }
}
