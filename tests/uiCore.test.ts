import { describe, it, expect } from 'vitest'
import { parseUiCoreProps } from '../src/parsers/uiCore.js'

describe('ui-core props parser', () => {
  it('parses XStack with static props', () => {
    const code = `<XStack alignItems="center" backgroundColor="$coral100" paddingHorizontal={6}>`

    const result = parseUiCoreProps(code)

    expect(result).toHaveLength(1)
    expect(result[0].componentType).toBe('XStack')
    expect(result[0].isAutoConvertible).toBe(true)
    expect(result[0].props.length).toBe(3)
  })

  it('parses YStack with numeric values', () => {
    const code = `<YStack gap={4} padding={16} flex={1}>`

    const result = parseUiCoreProps(code)

    expect(result).toHaveLength(1)
    expect(result[0].componentType).toBe('YStack')

    const gapProp = result[0].props.find((p) => p.name === 'gap')
    expect(gapProp?.value).toBe(4)
    expect(gapProp?.isStatic).toBe(true)
  })

  it('detects Tamagui tokens', () => {
    const code = `<XStack backgroundColor="$gray200" borderColor="$coral500">`

    const result = parseUiCoreProps(code)

    expect(result).toHaveLength(1)

    const bgProp = result[0].props.find((p) => p.name === 'backgroundColor')
    expect(bgProp?.tamaguiToken).toBe('$gray200')
  })

  it('detects dynamic/conditional props', () => {
    const code = `<Typography color={isActive ? '$gray900' : '$gray400'}>`

    const result = parseUiCoreProps(code)

    expect(result).toHaveLength(1)
    expect(result[0].isAutoConvertible).toBe(false)

    const colorProp = result[0].props.find((p) => p.name === 'color')
    expect(colorProp?.isStatic).toBe(false)
  })

  it('ignores non-style props', () => {
    const code = `<Button onPress={handlePress} disabled={loading} variant="primary">`

    const result = parseUiCoreProps(code)

    expect(result).toHaveLength(1)
    // onPress, disabled, variant should be filtered out
    expect(result[0].props).toHaveLength(0)
  })

  it('parses Typography component', () => {
    const code = `<Typography variant="$body2R" color="$gray700">`

    const result = parseUiCoreProps(code)

    expect(result).toHaveLength(1)
    expect(result[0].componentType).toBe('Typography')
  })

  it('handles multiple ui-core components', () => {
    const code = `
      <XStack alignItems="center">
        <YStack flex={1}>
          <Typography color="$gray900">
        </YStack>
      </XStack>
    `

    const result = parseUiCoreProps(code)

    expect(result.length).toBeGreaterThanOrEqual(3)
  })
})
