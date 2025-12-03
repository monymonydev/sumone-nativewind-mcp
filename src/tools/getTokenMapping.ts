import type { TokenMappingResult } from '../parsers/types.js'
import { mapToken } from '../tokens/index.js'

export type GetTokenMappingInput = {
  token: string
  type?: 'color' | 'spacing' | 'typography' | 'all'
}

export function getTokenMapping(input: GetTokenMappingInput): TokenMappingResult {
  return mapToken(input.token, input.type)
}
