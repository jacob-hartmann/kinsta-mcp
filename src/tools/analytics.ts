import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  buildParams,
} from "./utils.js";

const analyticsInputSchema = z.object({
  env_id: z.string().describe("The environment ID"),
  timeframe_start: z
    .string()
    .optional()
    .describe("Start date for the analytics period (ISO 8601 format)"),
  timeframe_end: z
    .string()
    .optional()
    .describe("End date for the analytics period (ISO 8601 format)"),
});

function registerAnalyticsTool(
  server: McpServer,
  name: string,
  description: string,
  pathSuffix: string
): void {
  server.registerTool(
    name,
    {
      description,
      inputSchema: analyticsInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/analytics/${pathSuffix}`,
        method: "GET",
        params: buildParams({
          timeframe_start: args.timeframe_start,
          timeframe_end: args.timeframe_end,
        }),
      });

      if (!result.success) return formatError(result.error, "analytics");
      return formatSuccess(result.data);
    }
  );
}

export function registerAnalyticsTools(server: McpServer): void {
  registerAnalyticsTool(
    server,
    "kinsta.analytics.visits",
    "Get visitor analytics for an environment over a date range.",
    "visits"
  );

  registerAnalyticsTool(
    server,
    "kinsta.analytics.visits-usage",
    "Get visitor usage analytics for an environment (billable visits).",
    "visits-usage"
  );

  registerAnalyticsTool(
    server,
    "kinsta.analytics.bandwidth",
    "Get bandwidth analytics for an environment over a date range.",
    "bandwidth"
  );

  registerAnalyticsTool(
    server,
    "kinsta.analytics.bandwidth-usage",
    "Get bandwidth usage analytics for an environment (billable bandwidth).",
    "bandwidth-usage"
  );

  registerAnalyticsTool(
    server,
    "kinsta.analytics.cdn-bandwidth",
    "Get CDN bandwidth analytics for an environment over a date range.",
    "cdn-bandwidth"
  );

  registerAnalyticsTool(
    server,
    "kinsta.analytics.cdn-bandwidth-usage",
    "Get CDN bandwidth usage analytics for an environment (billable CDN bandwidth).",
    "cdn-bandwidth-usage"
  );

  registerAnalyticsTool(
    server,
    "kinsta.analytics.disk-space",
    "Get disk space usage analytics for an environment.",
    "disk-space"
  );
}
