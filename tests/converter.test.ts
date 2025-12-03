import { describe, it, expect } from 'vitest'
import { convertProperty } from '../src/converters/rules.js'
import {
  convertStyledComponent,
  convertUiCoreProps,
} from '../src/converters/simpleConverter.js'
import type {
  StyledComponentPattern,
  UiCorePropsPattern,
} from '../src/parsers/types.js'

describe('conversion rules', () => {
  describe('flexbox properties', () => {
    it('converts flexDirection', () => {
      expect(convertProperty('flexDirection', 'row')).toBe('flex-row')
      expect(convertProperty('flexDirection', 'column')).toBe('flex-col')
    })

    it('converts alignItems', () => {
      expect(convertProperty('alignItems', 'center')).toBe('items-center')
      expect(convertProperty('alignItems', 'flex-start')).toBe('items-start')
    })

    it('converts justifyContent', () => {
      expect(convertProperty('justifyContent', 'center')).toBe('justify-center')
      expect(convertProperty('justifyContent', 'space-between')).toBe('justify-between')
    })

    it('converts flex', () => {
      expect(convertProperty('flex', 1)).toBe('flex-1')
    })
  })

  describe('spacing properties', () => {
    it('converts padding', () => {
      expect(convertProperty('padding', 16)).toBe('p-4')
      expect(convertProperty('padding', '16px')).toBe('p-4')
    })

    it('converts paddingHorizontal', () => {
      expect(convertProperty('paddingHorizontal', 8)).toBe('px-2')
    })

    it('converts margin', () => {
      expect(convertProperty('margin', 4)).toBe('m-1')
    })

    it('converts gap', () => {
      expect(convertProperty('gap', 4)).toBe('gap-1')
      expect(convertProperty('gap', 8)).toBe('gap-2')
    })
  })

  describe('color properties', () => {
    it('converts backgroundColor with token', () => {
      expect(convertProperty('backgroundColor', '$coral100')).toBe('bg-coral-100')
    })

    it('converts color with token', () => {
      expect(convertProperty('color', '$gray900')).toBe('text-gray-900')
    })

    it('converts hex colors', () => {
      expect(convertProperty('backgroundColor', '#ff0000')).toBe('bg-[#ff0000]')
    })
  })

  describe('border properties', () => {
    it('converts borderWidth', () => {
      expect(convertProperty('borderWidth', 1)).toBe('border')
      expect(convertProperty('borderWidth', 2)).toBe('border-2')
    })

    it('converts borderRadius', () => {
      expect(convertProperty('borderRadius', 8)).toBe('rounded-lg')
      expect(convertProperty('borderRadius', '$full')).toBe('rounded-full')
    })
  })

  describe('position properties', () => {
    it('converts position', () => {
      expect(convertProperty('position', 'absolute')).toBe('absolute')
      expect(convertProperty('position', 'relative')).toBe('relative')
    })

    it('converts position values', () => {
      expect(convertProperty('top', 0)).toBe('top-0')
      expect(convertProperty('left', 16)).toBe('left-4')
    })

    it('handles negative values', () => {
      expect(convertProperty('top', '-15px')).toBe('-top-[15px]')
    })
  })

  describe('opacity', () => {
    it('converts opacity', () => {
      expect(convertProperty('opacity', 0.5)).toBe('opacity-50')
      expect(convertProperty('opacity', 1)).toBe('opacity-100')
      expect(convertProperty('opacity', 0.8)).toBe('opacity-80')
    })
  })
})

describe('simpleConverter', () => {
  describe('convertStyledComponent', () => {
    it('converts auto-convertible styled component', () => {
      const pattern: StyledComponentPattern = {
        componentName: 'Container',
        baseElement: 'View',
        cssProperties: [
          { property: 'flex', value: '1', isStatic: true },
          { property: 'padding', value: '16px', isStatic: true },
        ],
        dynamicProps: [],
        themeReferences: [],
        isAutoConvertible: true,
        sourceLocation: { line: 1, column: 0 },
        rawCode: 'const Container = styled.View`flex: 1; padding: 16px;`',
      }

      const result = convertStyledComponent(pattern)

      expect(result.conversions).toHaveLength(1)
      expect(result.conversions[0].converted).toContain('flex-1')
      expect(result.conversions[0].converted).toContain('p-4')
      expect(result.skipped).toHaveLength(0)
    })

    it('skips non-auto-convertible patterns', () => {
      const pattern: StyledComponentPattern = {
        componentName: 'DynamicBox',
        baseElement: 'View',
        cssProperties: [],
        dynamicProps: ['active'],
        themeReferences: [],
        isAutoConvertible: false,
        sourceLocation: { line: 1, column: 0 },
        rawCode: 'const DynamicBox = styled.View`...`',
      }

      const result = convertStyledComponent(pattern)

      expect(result.conversions).toHaveLength(0)
      expect(result.skipped).toHaveLength(1)
      expect(result.skipped[0].reason).toContain('dynamic')
    })
  })

  describe('convertUiCoreProps', () => {
    it('converts ui-core props to className', () => {
      const pattern: UiCorePropsPattern = {
        componentType: 'XStack',
        props: [
          { name: 'alignItems', value: 'center', isStatic: true },
          { name: 'gap', value: 4, isStatic: true },
        ],
        isAutoConvertible: true,
        sourceLocation: { line: 1, column: 0 },
        rawCode: '<XStack alignItems="center" gap={4}>',
      }

      const result = convertUiCoreProps(pattern)

      expect(result.conversions).toHaveLength(1)
      expect(result.conversions[0].converted).toContain('items-center')
      expect(result.conversions[0].converted).toContain('gap-1')
    })

    it('handles Tamagui tokens', () => {
      const pattern: UiCorePropsPattern = {
        componentType: 'YStack',
        props: [
          {
            name: 'backgroundColor',
            value: '$coral100',
            isStatic: true,
            tamaguiToken: '$coral100',
          },
        ],
        isAutoConvertible: true,
        sourceLocation: { line: 1, column: 0 },
        rawCode: '<YStack backgroundColor="$coral100">',
      }

      const result = convertUiCoreProps(pattern)

      expect(result.conversions).toHaveLength(1)
      expect(result.conversions[0].converted).toContain('bg-coral-100')
    })
  })
})
