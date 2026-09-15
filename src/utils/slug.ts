/**
 * MCP-safe identifier helper for resource list names.
 *
 * Claude Desktop Chat and other clients reject names that do not match
 * `^[a-zA-Z0-9_-]{1,64}$`.
 */

export function mcpSafeName(value: string): string {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64) || "unnamed"
  );
}
