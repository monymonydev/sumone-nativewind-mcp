// TypeScript AST utilities (placeholder for future enhanced parsing)
// Currently using regex-based parsing, but can be extended with full AST parsing

export function isValidTypeScriptCode(code: string): boolean {
  // Basic validation
  return code.length > 0 && !code.includes('\0')
}
