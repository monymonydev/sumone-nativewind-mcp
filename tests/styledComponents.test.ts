import { describe, it, expect } from 'vitest'
import { parseStyledComponents } from '../src/parsers/styledComponents.js'

describe('styled-components parser', () => {
  it('parses basic styled.View', () => {
    const code = `const Container = styled.View\`
      flex: 1;
      padding: 16px;
      background-color: white;
    \``

    const result = parseStyledComponents(code)

    expect(result).toHaveLength(1)
    expect(result[0].componentName).toBe('Container')
    expect(result[0].baseElement).toBe('View')
    expect(result[0].isAutoConvertible).toBe(true)
    expect(result[0].cssProperties.length).toBeGreaterThan(0)
  })

  it('parses styled.Text with multiple properties', () => {
    const code = `const Title = styled.Text\`
      font-size: 24px;
      font-weight: bold;
      color: #333;
      text-align: center;
    \``

    const result = parseStyledComponents(code)

    expect(result).toHaveLength(1)
    expect(result[0].componentName).toBe('Title')
    expect(result[0].baseElement).toBe('Text')
    expect(result[0].isAutoConvertible).toBe(true)
  })

  it('detects dynamic props as non-auto-convertible', () => {
    const code = `const Box = styled.View<{active: boolean}>\`
      background-color: \${({active}) => active ? 'red' : 'blue'};
      padding: 16px;
    \``

    const result = parseStyledComponents(code)

    expect(result).toHaveLength(1)
    expect(result[0].isAutoConvertible).toBe(false)
    expect(result[0].dynamicProps).toContain('active')
  })

  it('detects theme references', () => {
    const code = `const Button = styled.TouchableOpacity\`
      background-color: \${({theme}) => theme.colors.primary};
      padding: 12px 24px;
    \``

    const result = parseStyledComponents(code)

    expect(result).toHaveLength(1)
    expect(result[0].isAutoConvertible).toBe(false)
    expect(result[0].themeReferences.length).toBeGreaterThan(0)
  })

  it('parses styled extending component', () => {
    const code = `const StyledButton = styled(BaseButton)\`
      margin: 8px;
    \``

    const result = parseStyledComponents(code)

    expect(result).toHaveLength(1)
    expect(result[0].componentName).toBe('StyledButton')
    expect(result[0].baseElement).toBe('BaseButton')
  })

  it('handles multiple styled components in one file', () => {
    const code = `
      const Header = styled.View\`flex: 1;\`
      const Title = styled.Text\`font-size: 20px;\`
      const Content = styled.View\`padding: 16px;\`
    `

    const result = parseStyledComponents(code)

    expect(result).toHaveLength(3)
    expect(result.map((r) => r.componentName)).toEqual(['Header', 'Title', 'Content'])
  })
})
