/*
 * author: dean
 * date: 2023-06-29
 * Progress bar with custom icon.
 */
import {type ComponentProps, useEffect, useRef, type ReactElement} from 'react'
import {Easing, type StyleProp, View, type ViewStyle} from 'react-native'
import {Animated} from 'react-native'
import {IMAGES} from '@constants/images'
import {useSumoneTheme} from 'src/providers/ThemeProvider'

const ICON_OFFSET_LEFT = 17
const ICON_OFFSET_TOP = -8

export interface ProgressBarProps {
  totalValue: number
  currentValue: number
  width?: number
  height?: number
  style?: Omit<StyleProp<ViewStyle>, 'width' | 'height'>
  styles?: {
    progress?: Omit<ComponentProps<typeof Animated.View>['style'], 'width'>
    icon?: Omit<ComponentProps<typeof Animated.View>['style'], 'position'>
  }
}

const ProgressBar = ({
  totalValue,
  currentValue,
  style,
  styles,
  width = 254,
  height = 18,
}: ProgressBarProps): ReactElement => {
  const {theme} = useSumoneTheme()

  const animValue = useRef(new Animated.Value(0)).current
  const toValue = (currentValue / (totalValue <= 0 ? 1 : totalValue)) * width

  useEffect(() => {
    Animated.timing(animValue, {
      toValue,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start()
  }, [animValue, toValue])

  const containerStyle: ViewStyle = {
    borderRadius: 10,
    backgroundColor: theme.main.colors.mono100,
    padding: 2,
    width,
    height,
    ...style,
  }

  const progressBarStyle: ComponentProps<typeof Animated.View>['style'] = {
    backgroundColor: theme.main.colors.emotionBasic[3],
    width: animValue.interpolate({
      inputRange: [0, 100],
      outputRange: [0, toValue],
      extrapolate: 'clamp',
    }),
    height: '100%',
    borderRadius: 10,
    ...styles?.progress,
  }

  const iconStyle: ComponentProps<typeof Animated.Image>['style'] = {
    position: 'absolute',
    top: ICON_OFFSET_TOP,
    left: animValue.interpolate({
      inputRange: [0, 100],
      outputRange: [0, toValue - ICON_OFFSET_LEFT],
      extrapolate: 'clamp',
    }),
    ...styles?.icon,
  }

  return (
    <View style={containerStyle}>
      <Animated.View style={progressBarStyle} />
      <Animated.Image source={IMAGES.PROGRESS_INDICATOR} style={iconStyle} />
    </View>
  )
}

export default ProgressBar
