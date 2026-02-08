/**
 * kinsta.ping Tool
 *
 * A lightweight smoke test tool that confirms the MCP server is running
 * and that Kinsta API credentials are configured.
 *
 * This tool does NOT make any API calls to Kinsta.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { isKinstaConfigured } from "../kinsta/auth.js";
import { formatMessage } from "./utils.js";

/**
 * Register the kinsta.ping tool
 */
export function registerPingTool(server: McpServer): void {
  server.registerTool(
    "kinsta.ping",
    {
      title: "Ping",
      description:
        "Check that the Kinsta MCP server is running and that API credentials " +
        "are configured. Does not make any API calls to Kinsta.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    (_args, _extra) => {
      const configured = isKinstaConfigured();

      if (!configured) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text:
                "Kinsta MCP server is running, but API credentials are not configured.\n\n" +
                "Please set the following environment variables:\n" +
                "  - KINSTA_API_KEY: Your Kinsta API key (from MyKinsta > Company settings > API Keys)\n" +
                "  - KINSTA_COMPANY_ID: Your Kinsta company ID",
            },
          ],
        };
      }

      return formatMessage(
        "Kinsta MCP server is running and API credentials are configured."
      );
    }
  );
}
