import { describe, it, expect } from 'vitest'
import { parseTamaguiStyled } from '../src/parsers/tamagui.js'

describe('Tamagui styled parser', () => {
  it('parses basic styled() without variants', () => {
    const code = `const Container = styled(XStack, {
      alignItems: 'center',
      padding: 16,
      backgroundColor: '$coral100',
    })`

    const result = parseTamaguiStyled(code)

    expect(result).toHaveLength(1)
    expect(result[0].componentName).toBe('Container')
    expect(result[0].baseComponent).toBe('XStack')
    expect(result[0].isAutoConvertible).toBe(true)
    expect(result[0].variants).toHaveLength(0)
  })

  it('parses styled() with named config', () => {
    const code = `const Button = styled(YStack, {
      name: 'Button',
      justifyContent: 'center',
      borderRadius: '$8',
    })`

    const result = parseTamaguiStyled(code)

    expect(result).toHaveLength(1)
    expect(result[0].componentName).toBe('Button')
    expect(result[0].baseComponent).toBe('YStack')
  })

  it('detects variants as non-auto-convertible', () => {
    const code = `const Button = styled(XStack, {
      variants: {
        size: {
          sm: { height: 32, paddingHorizontal: 10 },
          md: { height: 40, paddingHorizontal: 12 },
        },
      },
    })`

    const result = parseTamaguiStyled(code)

    expect(result).toHaveLength(1)
    expect(result[0].isAutoConvertible).toBe(false)
    expect(result[0].variants.length).toBeGreaterThan(0)
  })

  it('parses token values', () => {
    const code = `const Card = styled(YStack, {
      backgroundColor: '$gray100',
      padding: '$16',
      borderRadius: '$8',
    })`

    const result = parseTamaguiStyled(code)

    expect(result).toHaveLength(1)
    expect(result[0].staticStyles).toHaveProperty('backgroundColor', '$gray100')
  })
})
