// CSS property to Tailwind class mapping rules

export type ConversionRule = {
  property: string
  convert: (value: string | number) => string | null
}

// Flexbox properties
const FLEX_DIRECTION: Record<string, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
}

const ALIGN_ITEMS: Record<string, string> = {
  'flex-start': 'items-start',
  'flex-end': 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
}

const JUSTIFY_CONTENT: Record<string, string> = {
  'flex-start': 'justify-start',
  'flex-end': 'justify-end',
  center: 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
}

const ALIGN_SELF: Record<string, string> = {
  auto: 'self-auto',
  'flex-start': 'self-start',
  'flex-end': 'self-end',
  center: 'self-center',
  stretch: 'self-stretch',
  baseline: 'self-baseline',
}

// Position
const POSITION: Record<string, string> = {
  absolute: 'absolute',
  relative: 'relative',
}

// Overflow
const OVERFLOW: Record<string, string> = {
  visible: 'overflow-visible',
  hidden: 'overflow-hidden',
  scroll: 'overflow-scroll',
}

// Text align
const TEXT_ALIGN: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
}

// Font weight
const FONT_WEIGHT: Record<string, string> = {
  '100': 'font-thin',
  '200': 'font-extralight',
  '300': 'font-light',
  '400': 'font-normal',
  '500': 'font-medium',
  '600': 'font-semibold',
  '700': 'font-bold',
  '800': 'font-extrabold',
  '900': 'font-black',
  normal: 'font-normal',
  bold: 'font-bold',
}

import { pxToTailwind } from '../tokens/spacingMapping.js'
import { mapColorToken } from '../tokens/colorMapping.js'

function parsePixelValue(value: string): number | null {
  const match = value.match(/^(-?\d+(?:\.\d+)?)(?:px)?$/)
  return match ? parseFloat(match[1]) : null
}

function convertSpacingValue(value: string | number, prefix: string): string | null {
  if (typeof value === 'number') {
    return `${prefix}${pxToTailwind(value)}`
  }

  const px = parsePixelValue(value)
  if (px !== null) {
    if (px < 0) {
      return `-${prefix}${pxToTailwind(Math.abs(px))}`
    }
    return `${prefix}${pxToTailwind(px)}`
  }

  // Tamagui token
  if (value.startsWith('$')) {
    const tokenValue = value.replace('$', '')
    const num = parseInt(tokenValue, 10)
    if (!isNaN(num)) {
      return `${prefix}${pxToTailwind(num)}`
    }
  }

  return null
}

function convertColorValue(value: string, prefix: string): string | null {
  // Tamagui token
  if (value.startsWith('$')) {
    const result = mapColorToken(value)
    if (result.tailwindClass) {
      return `${prefix}${result.tailwindClass}`
    }
  }

  // Hex color
  if (value.startsWith('#')) {
    return `${prefix}[${value}]`
  }

  // Named colors
  const namedColors = ['white', 'black', 'transparent']
  if (namedColors.includes(value)) {
    return `${prefix}${value}`
  }

  return null
}

export const CONVERSION_RULES: ConversionRule[] = [
  // Flexbox
  {
    property: 'flexDirection',
    convert: (v) => FLEX_DIRECTION[String(v)] ?? null,
  },
  {
    property: 'alignItems',
    convert: (v) => ALIGN_ITEMS[String(v)] ?? null,
  },
  {
    property: 'justifyContent',
    convert: (v) => JUSTIFY_CONTENT[String(v)] ?? null,
  },
  {
    property: 'alignSelf',
    convert: (v) => ALIGN_SELF[String(v)] ?? null,
  },
  {
    property: 'flex',
    convert: (v) => {
      if (v === 1 || v === '1') return 'flex-1'
      return `flex-[${v}]`
    },
  },
  {
    property: 'flexGrow',
    convert: (v) => (v === 1 || v === '1' ? 'grow' : `grow-[${v}]`),
  },
  {
    property: 'flexShrink',
    convert: (v) => (v === 1 || v === '1' ? 'shrink' : `shrink-[${v}]`),
  },
  {
    property: 'flexWrap',
    convert: (v) =>
      v === 'wrap' ? 'flex-wrap' : v === 'nowrap' ? 'flex-nowrap' : null,
  },

  // Spacing - Padding
  { property: 'padding', convert: (v) => convertSpacingValue(v, 'p-') },
  { property: 'paddingTop', convert: (v) => convertSpacingValue(v, 'pt-') },
  { property: 'paddingBottom', convert: (v) => convertSpacingValue(v, 'pb-') },
  { property: 'paddingLeft', convert: (v) => convertSpacingValue(v, 'pl-') },
  { property: 'paddingRight', convert: (v) => convertSpacingValue(v, 'pr-') },
  { property: 'paddingHorizontal', convert: (v) => convertSpacingValue(v, 'px-') },
  { property: 'paddingVertical', convert: (v) => convertSpacingValue(v, 'py-') },

  // Spacing - Margin
  { property: 'margin', convert: (v) => convertSpacingValue(v, 'm-') },
  { property: 'marginTop', convert: (v) => convertSpacingValue(v, 'mt-') },
  { property: 'marginBottom', convert: (v) => convertSpacingValue(v, 'mb-') },
  { property: 'marginLeft', convert: (v) => convertSpacingValue(v, 'ml-') },
  { property: 'marginRight', convert: (v) => convertSpacingValue(v, 'mr-') },
  { property: 'marginHorizontal', convert: (v) => convertSpacingValue(v, 'mx-') },
  { property: 'marginVertical', convert: (v) => convertSpacingValue(v, 'my-') },

  // Gap
  { property: 'gap', convert: (v) => convertSpacingValue(v, 'gap-') },
  { property: 'rowGap', convert: (v) => convertSpacingValue(v, 'gap-y-') },
  { property: 'columnGap', convert: (v) => convertSpacingValue(v, 'gap-x-') },

  // Sizing
  { property: 'width', convert: (v) => convertSpacingValue(v, 'w-') },
  { property: 'height', convert: (v) => convertSpacingValue(v, 'h-') },
  { property: 'minWidth', convert: (v) => convertSpacingValue(v, 'min-w-') },
  { property: 'minHeight', convert: (v) => convertSpacingValue(v, 'min-h-') },
  { property: 'maxWidth', convert: (v) => convertSpacingValue(v, 'max-w-') },
  { property: 'maxHeight', convert: (v) => convertSpacingValue(v, 'max-h-') },

  // Position
  { property: 'position', convert: (v) => POSITION[String(v)] ?? null },
  { property: 'top', convert: (v) => convertSpacingValue(v, 'top-') },
  { property: 'bottom', convert: (v) => convertSpacingValue(v, 'bottom-') },
  { property: 'left', convert: (v) => convertSpacingValue(v, 'left-') },
  { property: 'right', convert: (v) => convertSpacingValue(v, 'right-') },
  {
    property: 'zIndex',
    convert: (v) => {
      const num = typeof v === 'number' ? v : parseInt(String(v), 10)
      if (isNaN(num)) return null
      if (v === 'auto') return 'z-auto'
      // Standard Tailwind z-index: 0, 10, 20, 30, 40, 50
      const standard = [0, 10, 20, 30, 40, 50]
      if (standard.includes(num)) return `z-${num}`
      return `z-[${num}]`
    },
  },

  // Colors
  { property: 'backgroundColor', convert: (v) => convertColorValue(String(v), 'bg-') },
  { property: 'color', convert: (v) => convertColorValue(String(v), 'text-') },
  { property: 'borderColor', convert: (v) => convertColorValue(String(v), 'border-') },

  // Border
  {
    property: 'borderWidth',
    convert: (v) => {
      const px = typeof v === 'number' ? v : parsePixelValue(String(v))
      if (px === 0) return 'border-0'
      if (px === 1) return 'border'
      if (px === 2) return 'border-2'
      if (px === 4) return 'border-4'
      if (px === 8) return 'border-8'
      return px !== null ? `border-[${px}px]` : null
    },
  },
  {
    property: 'borderRadius',
    convert: (v) => {
      if (v === '$full' || v === 9999 || v === '9999px') return 'rounded-full'
      const px = typeof v === 'number' ? v : parsePixelValue(String(v))
      if (px === 0) return 'rounded-none'
      if (px === 2) return 'rounded-sm'
      if (px === 4) return 'rounded'
      if (px === 6) return 'rounded-md'
      if (px === 8) return 'rounded-lg'
      if (px === 12) return 'rounded-xl'
      if (px === 16) return 'rounded-2xl'
      if (px === 24) return 'rounded-3xl'
      return px !== null ? `rounded-[${px}px]` : null
    },
  },

  // Opacity
  {
    property: 'opacity',
    convert: (v) => {
      const num = typeof v === 'number' ? v : parseFloat(String(v))
      if (isNaN(num)) return null
      const percent = Math.round(num * 100)
      // Standard: 0, 5, 10, 15, 20, 25, ..., 95, 100
      if (percent >= 0 && percent <= 100 && percent % 5 === 0) {
        return `opacity-${percent}`
      }
      return `opacity-[${num}]`
    },
  },

  // Overflow
  { property: 'overflow', convert: (v) => OVERFLOW[String(v)] ?? null },

  // Aspect Ratio
  {
    property: 'aspectRatio',
    convert: (v) => {
      const str = String(v)
      if (v === 1 || str === '1' || str === '1/1') return 'aspect-square'
      // Fraction format: 343/54, 16/9, etc. - preserve as-is
      if (/^\d+\s*\/\s*\d+$/.test(str)) {
        return `aspect-[${str.replace(/\s/g, '')}]`
      }
      // Numeric (float)
      if (typeof v === 'number' || /^\d+(\.\d+)?$/.test(str)) {
        return `aspect-[${str}]`
      }
      return null
    },
  },

  // Text
  { property: 'textAlign', convert: (v) => TEXT_ALIGN[String(v)] ?? null },
  { property: 'fontWeight', convert: (v) => FONT_WEIGHT[String(v)] ?? null },
  {
    property: 'fontSize',
    convert: (v) => {
      const px = typeof v === 'number' ? v : parsePixelValue(String(v))
      return px !== null ? `text-[${px}px]` : null
    },
  },
  {
    property: 'lineHeight',
    convert: (v) => {
      const px = typeof v === 'number' ? v : parsePixelValue(String(v))
      return px !== null ? `leading-[${px}px]` : null
    },
  },
  {
    property: 'letterSpacing',
    convert: (v) => {
      const num = typeof v === 'number' ? v : parseFloat(String(v))
      if (isNaN(num)) return null
      if (num === 0) return 'tracking-normal'
      return `tracking-[${num}px]`
    },
  },

  // Transform
  {
    property: 'rotate',
    convert: (v) => {
      const str = String(v)
      // Extract degrees: '25deg', '-2deg', '25', -2
      const match = str.match(/^(-?\d+(?:\.\d+)?)(deg)?$/)
      if (match) {
        const deg = match[1]
        return `rotate-[${deg}deg]`
      }
      return null
    },
  },
  {
    property: 'rotateZ',
    convert: (v) => {
      // Same logic as rotate - rotateZ is RN's way of expressing 2D rotation
      const str = String(v)
      const match = str.match(/^(-?\d+(?:\.\d+)?)(deg)?$/)
      if (match) {
        const deg = match[1]
        return `rotate-[${deg}deg]`
      }
      return null
    },
  },
  {
    property: 'scale',
    convert: (v) => {
      const num = typeof v === 'number' ? v : parseFloat(String(v))
      if (isNaN(num)) return null
      if (num === 1) return null // scale-100 is default, omit
      // Standard scales: 0, 50, 75, 90, 95, 100, 105, 110, 125, 150
      const standard = [0, 50, 75, 90, 95, 100, 105, 110, 125, 150]
      const percent = Math.round(num * 100)
      if (standard.includes(percent)) return `scale-${percent}`
      return `scale-[${num}]`
    },
  },
]

export function getConversionRule(property: string): ConversionRule | undefined {
  return CONVERSION_RULES.find((r) => r.property === property)
}

export function convertProperty(
  property: string,
  value: string | number
): string | null {
  const rule = getConversionRule(property)
  if (!rule) return null
  return rule.convert(value)
}
