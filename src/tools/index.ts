/**
 * MCP Tools Registration
 *
 * Registers all available tools with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPingTool } from "./ping.js";
import { registerOperationTools } from "./operations.js";
import { registerCompanyTools } from "./company.js";
import { registerDnsTools } from "./dns.js";
import { registerSiteTools } from "./sites.js";
import { registerEnvironmentTools } from "./environments.js";
import { registerSiteOperationTools } from "./site-tools.js";
import { registerPluginThemeTools } from "./plugins-themes.js";
import { registerDomainTools } from "./domains.js";
import { registerEdgeCdnTools } from "./edge-cdn.js";
import { registerSftpUserTools } from "./sftp-users.js";
import { registerAnalyticsTools } from "./analytics.js";
import { registerBackupTools } from "./backups.js";
import { registerLogTools } from "./logs.js";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  registerPingTool(server);
  registerOperationTools(server);
  registerCompanyTools(server);
  registerDnsTools(server);
  registerSiteTools(server);
  registerEnvironmentTools(server);
  registerSiteOperationTools(server);
  registerPluginThemeTools(server);
  registerDomainTools(server);
  registerEdgeCdnTools(server);
  registerSftpUserTools(server);
  registerAnalyticsTools(server);
  registerBackupTools(server);
  registerLogTools(server);
}
