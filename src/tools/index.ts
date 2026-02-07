/**
 * MCP Tools Registration
 *
 * Registers all available tools with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPingTool } from "./ping.js";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  registerPingTool(server);
}
