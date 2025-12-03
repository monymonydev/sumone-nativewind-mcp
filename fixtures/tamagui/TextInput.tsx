import {type GetProps, styled} from '@tamagui/core'

import {type Ref, type ReactElement, forwardRef} from 'react'
import {TextInput} from 'react-native'

const StyledInput = styled(TextInput, {
  name: 'BaseTextInput',
  variants: {
    variant: {
      $body2R: {
        fontFamily: '$body2R',
        fontSize: 15,
        lineHeight: 24,
        textAlignVertical: 'top',
        color: '#181818',
      },
      $heading3B: {
        fontFamily: '$heading3B',
        fontSize: 22,
        textAlignVertical: 'top',
        color: '#181818',
      },
    },
  },
})

const TextInputComponent = (
  {
    variant,
    ...props
  }: GetProps<typeof StyledInput> & {
    variant: '$body2R' | '$heading3B'
  },
  ref: Ref<TextInput> | null,
): ReactElement => {
  return <StyledInput ref={ref} variant={variant} {...props} />
}

export const BaseTextInput = forwardRef(TextInputComponent)

BaseTextInput.displayName = 'BaseTextInput'
