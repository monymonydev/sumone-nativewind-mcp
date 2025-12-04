import {YStack} from '@monymony-public/ui-core'
import {color} from '@monymony-public/ui-theme'
import {type ReactElement} from 'react'
import {
  Image,
  type TouchableOpacityProps,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

export interface CircularButtonProps {
  size?: number
  onPress?: () => void
  source: ImageSourcePropType
  disabled?: TouchableOpacityProps['disabled']
  activeOpacity?: TouchableOpacityProps['activeOpacity']
  style?: StyleProp<ViewStyle>
}

const CircularButton = ({
  size = 48,
  onPress,
  source,
  disabled,
  activeOpacity = 0.7,
  style,
}: CircularButtonProps): ReactElement => {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={size / 2}
      borderWidth={0.5}
      borderColor={color.gray[100]}
      backgroundColor="white"
      activeOpacity={activeOpacity}
      justifyContent="center"
      alignItems="center"
      onPress={onPress}
      disabled={disabled}
      style={style}>
      <Image source={source} width={size} height={size} />
    </YStack>
  )
}

export default CircularButton
