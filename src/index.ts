#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { analyzeComponent } from './tools/analyzeComponent.js'
import { convertStyles } from './tools/convertStyles.js'
import { getTokenMapping } from './tools/getTokenMapping.js'
import { suggestMigration } from './tools/suggestMigration.js'
import { batchAnalyze } from './tools/batchAnalyze.js'
import { generateTailwindConfig } from './tools/generateTailwindConfig.js'

const server = new Server(
  {
    name: 'sumone-nativewind-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'analyze_component',
        description:
          'Analyze styling patterns in a React Native component file. Identifies styled-components, Tamagui styled(), and ui-core props. Returns categorization of patterns as auto-convertible, AI-assisted, or manual.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Absolute path to the .tsx file to analyze',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'convert_styles',
        description:
          'Auto-convert deterministic styling patterns to NativeWind className syntax. Returns converted code for simple patterns and skipped items with reasons for complex ones.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Absolute path to the .tsx file to convert',
            },
            dryRun: {
              type: 'boolean',
              description: 'Preview changes without applying (default: true)',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'get_token_mapping',
        description:
          'Map a Tamagui/ui-theme token to its Tailwind class equivalent. Supports design system tokens ($coral100, $body2R), legacy tokens (theme.main.colors.mono100, theme.fonts.heading1), and spacing tokens ($16).',
        inputSchema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token to map (e.g., $coral100, $body2R, theme.main.colors.mono100, theme.fonts.heading1)',
            },
            type: {
              type: 'string',
              enum: ['color', 'spacing', 'typography', 'legacy', 'all'],
              description: 'Token type hint (optional, auto-detected if omitted)',
            },
            locale: {
              type: 'string',
              enum: ['ko', 'en', 'ja', 'tw', 'zh', 'de', 'es', 'fr', 'vi', 'th'],
              description: 'Locale for typography mapping (default: ko). Affects font family selection.',
            },
          },
          required: ['token'],
        },
      },
      {
        name: 'suggest_migration',
        description:
          'Generate migration spec for complex styling patterns. Returns cva config for Tamagui variants, clsx patterns for conditionals, and hybrid approaches for dynamic values.',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Code snippet containing styling to migrate',
            },
            context: {
              type: 'string',
              description: 'Additional context about the component purpose',
            },
          },
          required: ['code'],
        },
      },
      {
        name: 'batch_analyze',
        description:
          'Analyze multiple files in a directory for migration planning. Returns summary statistics, pattern counts, token usage, and complex cases requiring manual attention.',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Directory path to scan',
            },
            pattern: {
              type: 'string',
              description: 'File pattern to match (default: **/*.tsx)',
            },
            limit: {
              type: 'number',
              description: 'Maximum files to analyze (default: 100)',
            },
          },
          required: ['directory'],
        },
      },
      {
        name: 'generate_tailwind_config',
        description:
          'Generate a complete Tailwind config with design system colors, legacy colors (prefixed with legacy-), and locale-aware font families.',
        inputSchema: {
          type: 'object',
          properties: {
            includeLegacy: {
              type: 'boolean',
              description: 'Include legacy colors from sumone-mobile theme (default: true)',
            },
            locale: {
              type: 'string',
              enum: ['ko', 'en', 'ja', 'tw', 'zh', 'de', 'es', 'fr', 'vi', 'th'],
              description: 'Primary locale for font family config (default: ko)',
            },
          },
        },
      },
    ],
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params

  try {
    switch (name) {
      case 'analyze_component': {
        if (!args.filePath) throw new Error('filePath is required')
        const result = analyzeComponent({
          filePath: args.filePath as string,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'convert_styles': {
        if (!args.filePath) throw new Error('filePath is required')
        const result = convertStyles({
          filePath: args.filePath as string,
          dryRun: args.dryRun as boolean | undefined,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'get_token_mapping': {
        if (!args.token) throw new Error('token is required')
        const result = getTokenMapping({
          token: args.token as string,
          type: args.type as 'color' | 'spacing' | 'typography' | 'legacy' | 'all' | undefined,
          locale: args.locale as 'ko' | 'en' | 'ja' | 'tw' | 'zh' | 'de' | 'es' | 'fr' | 'vi' | 'th' | undefined,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'suggest_migration': {
        if (!args.code) throw new Error('code is required')
        const result = suggestMigration({
          code: args.code as string,
          context: args.context as string | undefined,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'batch_analyze': {
        if (!args.directory) throw new Error('directory is required')
        const result = batchAnalyze({
          directory: args.directory as string,
          pattern: args.pattern as string | undefined,
          limit: args.limit as number | undefined,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'generate_tailwind_config': {
        const result = generateTailwindConfig({
          includeLegacy: args.includeLegacy as boolean | undefined,
          locale: args.locale as 'ko' | 'en' | 'ja' | 'tw' | 'zh' | 'de' | 'es' | 'fr' | 'vi' | 'th' | undefined,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('sumone-nativewind-mcp server running on stdio')
}

main().catch(console.error)
