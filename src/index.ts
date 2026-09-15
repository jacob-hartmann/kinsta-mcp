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
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { McpServer } from "@modelcontextprotocol/server";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

const SERVER_NAME = "kinsta-mcp";

// Read version from package.json to keep it in sync
const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };
const SERVER_VERSION = packageJson.version;

/**
 * Create an MCP server with all handlers registered
 */
function createServer(): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        "Kinsta MCP server for managing WordPress sites on Kinsta hosting. " +
        "Start with kinsta_ping to verify connectivity. Use kinsta_sites_list to discover sites, " +
        "then kinsta_environments_list to find environments. Most mutating operations return an " +
        "operation_id — poll kinsta_operations_status to track progress. " +
        "Environment IDs (env_id) are required for most tools.",
    }
  );

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}

/**
 * Main entry point
 */
function main(): void {
  console.error(
    `[${SERVER_NAME}] Starting server v${SERVER_VERSION} (stdio transport)...`
  );
  const handle = serveStdio(createServer);

  process.on("SIGTERM", () => {
    void handle.close();
  });
  process.on("SIGINT", () => {
    void handle.close();
  });

  console.error(`[${SERVER_NAME}] Server running on stdio transport`);
}

// Run the server
try {
  main();
} catch (error: unknown) {
  console.error(`[${SERVER_NAME}] Fatal error:`, error);
  process.exit(1);
}
