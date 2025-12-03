# Test Fixtures

Real component examples from sumone-mobile for testing migration tool output.

## Usage

Test the MCP tools against these fixtures:

```bash
# Analyze a component
node dist/index.js  # Start MCP server, then use tools

# Or run directly with ts-node for testing
npx ts-node -e "
import { analyzeComponent } from './src/tools/analyzeComponent.js';
console.log(JSON.stringify(analyzeComponent({ filePath: './fixtures/ui-core/LabelBadge.tsx' }), null, 2));
"
```

## Fixtures

### styled-components/Badge.tsx
- **Pattern**: styled-components/native with `css` helper
- **Complexity**: Dynamic props (color, opacity, position)
- **Expected**: Non-auto-convertible, needs clsx for conditionals

### ui-core/LabelBadge.tsx
- **Pattern**: @monymony-public/ui-core (XStack, Typography)
- **Complexity**: Tamagui tokens ($coral100, $gray900) + relativeSizeUtil
- **Expected**: Partial auto-convert (tokens work), manual for relativeSizeUtil

### tamagui/TextInput.tsx
- **Pattern**: Tamagui `styled()` with variants
- **Complexity**: Explicit variants ($body2R, $heading3B)
- **Expected**: Generate cva config for variants

### complex/ProgressBar.tsx
- **Pattern**: Mixed React Native StyleSheet + theme context
- **Complexity**: theme.main.colors, Animated API, interpolation
- **Expected**: Flag for manual - too dynamic for auto-conversion

## Adding New Fixtures

1. Copy component from sumone-mobile to appropriate category folder
2. Test with `analyze_component` tool
3. Verify output matches expected behavior
