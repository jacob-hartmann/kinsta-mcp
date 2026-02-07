#!/usr/bin/env node
/**
 * Kinsta MCP Server
 *
 * A Model Context Protocol (MCP) server for Kinsta WordPress hosting.
 *
 * This server provides tools, resources, and prompts for interacting
 * with the Kinsta API via MCP-compatible clients.
 *
 * Transport: stdio (JSON-RPC over stdin/stdout)
 *
 * All logging goes to stderr to avoid corrupting JSON-RPC over stdout.
 *
 * @see https://modelcontextprotocol.io/
 * @see https://kinsta.com/docs/kinsta-api/
 */

import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

const SERVER_NAME = "kinsta-mcp";

// Read version from package.json to keep it in sync
const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };
const SERVER_VERSION = packageJson.version;

/**
 * Start the server in stdio mode
 */
async function startStdioServer(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${SERVER_NAME}] Server running on stdio transport`);
}

/**
 * Create an MCP server with all handlers registered
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.error(
    `[${SERVER_NAME}] Starting server v${SERVER_VERSION} (stdio transport)...`
  );
  await startStdioServer(createServer());
}

// Run the server
main().catch((error: unknown) => {
  console.error(`[${SERVER_NAME}] Fatal error:`, error);
  process.exit(1);
});
