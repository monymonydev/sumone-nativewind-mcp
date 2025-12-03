import { describe, it, expect } from 'vitest'
import { mapToken } from '../src/tokens/index.js'
import { mapColorToken } from '../src/tokens/colorMapping.js'
import { mapSpacingToken, pxToTailwind } from '../src/tokens/spacingMapping.js'
import { mapTypographyToken } from '../src/tokens/typographyMapping.js'

describe('token mapping', () => {
  describe('color tokens', () => {
    it('maps color token to Tailwind class', () => {
      const result = mapColorToken('$coral100')

      expect(result.category).toBe('color')
      expect(result.tailwindClass).toBe('coral-100')
      expect(result.customRequired).toBe(true)
    })

    it('returns unknown for invalid token', () => {
      const result = mapColorToken('$invalidColor')

      expect(result.category).toBe('unknown')
      expect(result.tailwindClass).toBeNull()
    })
  })

  describe('spacing tokens', () => {
    it('maps spacing token to Tailwind value', () => {
      const result = mapSpacingToken('$16')

      expect(result.category).toBe('spacing')
      expect(result.tailwindClass).toBe('4')
      expect(result.cssValue).toBe('16px')
    })

    it('maps small spacing correctly', () => {
      const result = mapSpacingToken('$4')

      expect(result.tailwindClass).toBe('1')
    })

    it('maps large spacing correctly', () => {
      const result = mapSpacingToken('$48')

      expect(result.tailwindClass).toBe('12')
    })

    it('uses arbitrary value for non-standard spacing', () => {
      const result = mapSpacingToken('$18')

      expect(result.tailwindClass).toBe('[18px]')
    })
  })

  describe('typography tokens', () => {
    it('splits typography token into utilities', () => {
      const result = mapTypographyToken('$body2R')

      expect(result.category).toBe('typography')
      expect(result.tailwindClass).toContain('font-pretendard')
      expect(result.tailwindClass).toContain('text-[15px]')
    })

    it('includes line height for typography tokens', () => {
      const result = mapTypographyToken('$body2R')

      expect(result.tailwindClass).toContain('leading-')
    })
  })

  describe('auto-detection', () => {
    it('auto-detects color tokens', () => {
      const result = mapToken('$coral500')

      expect(result.category).toBe('color')
    })

    it('auto-detects spacing tokens', () => {
      const result = mapToken('$24')

      expect(result.category).toBe('spacing')
    })

    it('auto-detects typography tokens', () => {
      const result = mapToken('$headline1B')

      expect(result.category).toBe('typography')
    })
  })

  describe('pxToTailwind', () => {
    it('converts standard values', () => {
      expect(pxToTailwind(0)).toBe('0')
      expect(pxToTailwind(4)).toBe('1')
      expect(pxToTailwind(8)).toBe('2')
      expect(pxToTailwind(16)).toBe('4')
      expect(pxToTailwind(32)).toBe('8')
    })

    it('uses arbitrary values for non-standard', () => {
      expect(pxToTailwind(7)).toBe('[7px]')
      expect(pxToTailwind(100)).toBe('[100px]')
    })
  })
})
