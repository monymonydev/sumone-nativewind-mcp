import type { TokenMappingResult } from '../parsers/types.js'
import { mapToken, type SupportedLocale } from '../tokens/index.js'

export type GetTokenMappingInput = {
  token: string
  type?: 'color' | 'spacing' | 'typography' | 'legacy' | 'all'
  locale?: SupportedLocale
}

export function getTokenMapping(input: GetTokenMappingInput): TokenMappingResult {
  return mapToken(input.token, {
    type: input.type,
    locale: input.locale,
  })
}
