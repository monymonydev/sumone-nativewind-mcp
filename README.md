# sumone-nativewind-mcp

MCP server for migrating React Native styling from styled-components/Tamagui/@monymony-public/ui-core to NativeWind.

## Tools

### `analyze_component`
Analyze styling patterns in a React Native component file. Returns categorization of patterns as auto-convertible, AI-assisted, or manual.

### `convert_styles`
Auto-convert deterministic styling patterns to NativeWind className syntax.

### `get_token_mapping`
Map a Tamagui/ui-theme token to its Tailwind class equivalent.

### `suggest_migration`
Generate migration spec for complex styling patterns (cva for variants, clsx for conditionals).

### `batch_analyze`
Analyze multiple files in a directory for migration planning.

## Setup

```bash
yarn install
yarn build
```

## Usage

Add to Claude Code MCP config:

```json
{
  "mcpServers": {
    "sumone-nativewind-mcp": {
      "command": "node",
      "args": ["/path/to/sumone-nativewind-mcp/dist/index.js"]
    }
  }
}
```

## Development

```bash
yarn dev      # Watch mode
yarn test     # Run tests
yarn test:run # Run tests once
```
