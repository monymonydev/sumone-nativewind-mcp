/**
 * Legacy token mappings from sumone-mobile
 * These should eventually be migrated to design system tokens from @monymony-public/ui-theme
 */

// Legacy colors from sumone-mobile/src/theme/index.ts
export const LEGACY_COLORS = {
  // Mono colors
  mono100: '#ffffff',
  mono150: '#f3f3f3',
  mono200: '#f0f0f0',
  mono300: '#e0e0e0',
  mono400: '#b0b0b0',
  mono500: '#a0a0a0',
  mono600: '#848484',
  mono700: '#676767',
  mono800: '#444444',
  mono900: '#000000',
  // Main colors (coral-ish)
  main300: '#ffd2c7',
  main500: '#ffae9a',
  main700: '#f98f75',
  // Red colors
  red200: '#ff7250',
  red400: '#ff0000',
  // Button colors
  button500: '#c5b698',
  buttonSpecial: '#c9b589',
  // Other
  rustyRed: '#c11a1a',
} as const

export type LegacyColorKey = keyof typeof LEGACY_COLORS

// Suggested migrations from legacy → design system
export const LEGACY_COLOR_MIGRATIONS: Partial<Record<LegacyColorKey, string>> = {
  mono100: 'white',
  mono900: 'black',
  mono800: 'gray-900',
  mono700: 'gray-700',
  mono600: 'gray-600',
  mono500: 'gray-500',
  mono400: 'gray-400',
  mono300: 'gray-100',
  mono200: 'gray-050',
  main700: 'coral-500',
  main500: 'coral-300',
  main300: 'coral-100',
  red400: 'red-500',
}

// Legacy typography from sumone-mobile/src/theme/typographies.ts
export const LEGACY_TYPOGRAPHY = {
  heading1: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 30,
    lineHeight: 30,
    letterSpacing: 1.02,
  },
  heading2: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 0.82,
  },
  title1Bold: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.68,
  },
  title1Regular: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.68,
  },
  title2: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: 0.68,
  },
  title3Bold: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 17,
    lineHeight: 27,
    letterSpacing: 0.58,
  },
  title3Regular: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 17,
    lineHeight: 27,
    letterSpacing: 0.58,
  },
  title4: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 15,
    lineHeight: 27,
    letterSpacing: 0.68,
  },
  body1Bold: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0.68,
  },
  body1Regular: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0.68,
  },
  body2Bold: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 13,
    lineHeight: 23,
    letterSpacing: 0.2,
  },
  body2Regular: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 13,
    lineHeight: 23,
    letterSpacing: 0.2,
  },
  body3Bold: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.18,
  },
  body3Regular: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.18,
  },
  body4: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 11,
    lineHeight: 18,
  },
  username1: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 14,
    lineHeight: 26,
  },
  username2: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 12,
    lineHeight: 18,
  },
  petDiary1: {
    fontFamily: 'NanumJungHagSaeng',
    fontSize: 24,
    lineHeight: 22,
  },
  petDiary2: {
    fontFamily: 'NanumJungHagSaeng',
    fontSize: 20,
    lineHeight: 22,
  },
  petDiary3: {
    fontFamily: 'NanumJungHagSaeng',
    fontSize: 17,
    lineHeight: 18,
  },
  petDiary4: {
    fontFamily: 'NanumJungHagSaeng',
    fontSize: 17,
    lineHeight: 18,
  },
  description: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 12,
    lineHeight: 18,
  },
  number1: {
    fontFamily: 'MarkMyWords',
    fontSize: 30,
    lineHeight: 36,
  },
  number2: {
    fontFamily: 'MarkMyWords',
    fontSize: 24,
    lineHeight: 20,
  },
  number3: {
    fontFamily: 'MarkMyWords',
    fontSize: 20,
    lineHeight: 20,
  },
  number4: {
    fontFamily: 'MarkMyWords',
    fontSize: 15,
    lineHeight: 22,
  },
  number5: {
    fontFamily: 'MarkMyWords',
    fontSize: 12,
    lineHeight: 15,
  },
  number6: {
    fontFamily: 'MarkMyWords',
    fontSize: 10,
    lineHeight: 20,
  },
  itemBody: {
    fontFamily: 'GyeonggiBatangBOTF',
    fontSize: 11,
    lineHeight: 15,
  },
  banner: {
    fontFamily: 'NanumJungHagSaeng',
    fontSize: 17,
    lineHeight: 17,
  },
  emotion: {
    fontFamily: 'NanumJungHagSaeng',
    fontSize: 20,
    lineHeight: 22,
  },
  error: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 12,
    lineHeight: 15,
  },
  warning: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 12,
    lineHeight: 15,
  },
  date1: {
    fontFamily: 'GyeonggiBatangROTF',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.18,
  },
  caption: {
    fontFamily: 'KOTRAHOPE',
    fontSize: 13,
    lineHeight: 15,
  },
} as const

export type LegacyTypographyKey = keyof typeof LEGACY_TYPOGRAPHY

// Font family to Tailwind class mapping
// Organized by locale support
export const FONT_FAMILY_TAILWIND_MAP: Record<string, string> = {
  // Korean (ko)
  GyeonggiBatangBOTF: 'font-body-ko-bold',
  GyeonggiBatangROTF: 'font-body-ko',
  // Japanese (ja)
  'Mamelon-4-Hi-Regular': 'font-body-ja',
  'Mamelon-5-Hi-Regular': 'font-body-ja-bold',
  // Taiwanese (tw)
  'FakePearl-Regular': 'font-body-tw',
  'FakePearl-SemiBold': 'font-body-tw-bold',
  // English/Latin (en, de, es, fr, vi, th)
  Maitree: 'font-body-en',
  'Maitree-SemiBold': 'font-body-en-bold',
  // Common fonts (all locales)
  MarkMyWords: 'font-marker',
  KOTRAHOPE: 'font-kotra',
  NanumJungHagSaeng: 'font-nanum',
}

// Locale to font family mapping
export const LOCALE_FONT_MAP: Record<
  string,
  { regular: string; bold: string }
> = {
  ko: { regular: 'GyeonggiBatangROTF', bold: 'GyeonggiBatangBOTF' },
  ja: { regular: 'Mamelon-4-Hi-Regular', bold: 'Mamelon-5-Hi-Regular' },
  tw: { regular: 'FakePearl-Regular', bold: 'FakePearl-SemiBold' },
  en: { regular: 'Maitree', bold: 'Maitree-SemiBold' },
  de: { regular: 'Maitree', bold: 'Maitree-SemiBold' },
  es: { regular: 'Maitree', bold: 'Maitree-SemiBold' },
  fr: { regular: 'Maitree', bold: 'Maitree-SemiBold' },
  vi: { regular: 'Maitree', bold: 'Maitree-SemiBold' },
  th: { regular: 'Maitree', bold: 'Maitree-SemiBold' },
}

export type SupportedLocale = keyof typeof LOCALE_FONT_MAP
