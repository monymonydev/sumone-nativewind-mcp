import {type ReactElement} from 'react'
import styled, {css} from 'styled-components/native'

interface StyleProps {
  color?: string
  opacity?: number
  badgePlacement?: 'left' | 'top' | 'bottom' | 'right'
  border?: string
  textColor?: string
  size?: number
}

export interface BadgeProps extends StyleProps {
  count?: number
  maximumCount?: number
  showZero?: boolean
  opacityVisible?: boolean
  variant?: 'standard' | 'dot'
}

/**
 * @desc copy & paste from V1
 *
 */
const Badge = ({
  count = 1,
  color = '#34AFF9',
  maximumCount = 99,
  showZero,
  opacityVisible = true,
  variant = 'standard',
  badgePlacement: position = 'right',
  border,
  textColor = '#FFFFFF',
  size,
}: BadgeProps): ReactElement | null => {
  const opacity = maximumCount < count && opacityVisible ? 0.6 : 1
  const countText = maximumCount < count ? count + '+' : count

  if (!showZero && count === 0) {
    return null
  }

  if (variant === 'dot') {
    return <StyledDotView color={color} badgePlacement={position} size={size} />
  }

  return (
    <StyledView
      color={color}
      opacity={opacity}
      badgePlacement={position}
      border={border}>
      <StyledText textColor={textColor}>{countText}</StyledText>
    </StyledView>
  )
}

export default Badge

const StyledView = styled.View<StyleProps>`
  position: absolute;
  top: -15px;
  width: auto;
  min-width: 45px;
  height: 45px;
  border-width: 3px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  ${props => css`
    ${props.badgePlacement}: -10px;
    opacity: ${props.opacity};
    border-color: ${props.border || '#00ff0000'};
    background-color: ${props.color};
  `}
`

const StyledText = styled.Text<StyleProps>`
  font-weight: 500;
  font-size: 20px;
  text-align: center;
  padding: 5px;
  margin-left: 3px;
  margin-right: 3px;
  ${props => css`
    color: ${props.textColor};
  `}
`

const StyledDotView = styled.View<StyleProps>`
  position: absolute;
  top: 2px;
  right: 2px;
  width: ${({size}) => (size ? size : '20px')};
  height: ${({size}) => (size ? size : '20px')};
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  ${props => css`
    /* ${props.badgePlacement}: -5px; */
    background-color: ${props.color};
  `}
`
