/**
 * @name LabelBadge
 *
 * Keep Convention: https://www.notion.so/monymonyteam/FE-coding-convention-3dc105ca11954208a95e2bac0abdf98e
 */
import {Typography, XStack} from '@monymony-public/ui-core'
import {type ColorTokens} from '@tamagui/core'
import {type ReactElement} from 'react'
import relativeSizeUtil from '@utils/relativeSizeUtil'
import {useSumoneTheme} from 'src/providers/ThemeProvider'

export interface LabelBadgeProps {
  text: string
  backgroundColor?: ColorTokens
  textColor?: ColorTokens
}

const LabelBadge = ({
  text,
  backgroundColor,
  textColor,
}: LabelBadgeProps): ReactElement => {
  /** *** Library hook as `useRoute` ******/
  const {
    theme: {scale},
  } = useSumoneTheme()
  /** *** Store hook as `useSelector` ******/

  /** *** useRef ******/

  /** *** Local state as `useState` ******/

  /** *** Custom Hook as `useXXXX` ******/

  /** *** GraphQL Hook ******/

  /** *** Variables using useMemo ******/

  /** *** Variables as const, let ******/

  /** *** Functions ******/

  /** *** LifeCycle and side effect hooks and functions as `useEffect` ******/

  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      backgroundColor={backgroundColor ?? '$coral100'}
      height={relativeSizeUtil.getRelativeSize(18, scale)}
      paddingVertical={relativeSizeUtil.getRelativeSize(2, scale)}
      paddingHorizontal={relativeSizeUtil.getRelativeSize(6, scale)}
      borderTopLeftRadius={relativeSizeUtil.getRelativeSize(8, scale)}
      borderBottomRightRadius={relativeSizeUtil.getRelativeSize(8, scale)}>
      <Typography variant="$badge3" color={textColor ?? '$gray900'}>
        {text}
      </Typography>
    </XStack>
  )
}

export default LabelBadge
