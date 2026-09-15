import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  formatValidationError,
  buildParams,
  validateId,
} from "./utils.js";

const analyticsInputSchema = z.object({
  env_id: z.string().describe("The environment ID"),
  time_span: z.enum(["24_hours", "7_days", "30_days", "60_days"]).optional(),
  from: z.string().optional().describe("Custom start date (YYYY-MM-DD)"),
  to: z.string().optional().describe("Custom end date (YYYY-MM-DD)"),
});

function registerAnalyticsTool(
  server: McpServer,
  name: string,
  title: string,
  description: string,
  pathSuffix: string
): void {
  server.registerTool(
    name,
    {
      title,
      description,
      inputSchema: analyticsInputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const idError = validateId(args.env_id, "env_id");
      if (idError) return formatValidationError(idError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);
      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/analytics/${pathSuffix}`,
        method: "GET",
        params: buildParams({
          company_id: clientResult.client.getCompanyId(),
          time_span: args.time_span,
          from: args.from,
          to: args.to,
        }),
      });
      if (!result.success) return formatError(result.error, "analytics");
      return formatSuccess(result.data);
    }
  );
}

function registerUsageTool(
  server: McpServer,
  name: string,
  title: string,
  description: string,
  pathSegment: string
): void {
  server.registerTool(
    name,
    {
      title,
      description,
      inputSchema: z.object({ site_id: z.string().describe("The site ID") }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const idError = validateId(args.site_id, "site_id");
      if (idError) return formatValidationError(idError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);
      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}/usage/${pathSegment}/this-month`,
        method: "GET",
      });
      if (!result.success) return formatError(result.error, "analytics");
      return formatSuccess(result.data);
    }
  );
}

export function registerAnalyticsTools(server: McpServer): void {
  registerAnalyticsTool(
    server,
    "kinsta_analytics_visits",
    "Get Visit Analytics",
    "Get visitor analytics for an environment.",
    "visits"
  );
  registerUsageTool(
    server,
    "kinsta_analytics_visits-usage",
    "Get Monthly Visit Usage",
    "Get this month's billable visit usage for a site.",
    "visits"
  );
  registerAnalyticsTool(
    server,
    "kinsta_analytics_bandwidth",
    "Get Bandwidth Analytics",
    "Get bandwidth analytics for an environment.",
    "bandwidth"
  );
  registerUsageTool(
    server,
    "kinsta_analytics_bandwidth-usage",
    "Get Monthly Bandwidth Usage",
    "Get this month's billable bandwidth usage for a site.",
    "bandwidth"
  );
  registerAnalyticsTool(
    server,
    "kinsta_analytics_cdn-bandwidth",
    "Get CDN Bandwidth Analytics",
    "Get CDN bandwidth analytics for an environment.",
    "cdn-bandwidth"
  );
  registerUsageTool(
    server,
    "kinsta_analytics_cdn-bandwidth-usage",
    "Get Monthly CDN Bandwidth Usage",
    "Get this month's billable CDN bandwidth usage for a site.",
    "cdn-bandwidth"
  );
  server.registerTool(
    "kinsta_analytics_disk-space",
    {
      title: "Get Disk Space Analytics",
      description: "Get disk space analytics for an environment.",
      inputSchema: analyticsInputSchema.extend({
        time_span: z.enum(["7_days", "30_days", "60_days"]).optional(),
        time_zone: z.string().regex(/^-?(0[0-9]|1[0-4]):00$/),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const idError = validateId(args.env_id, "env_id");
      if (idError) return formatValidationError(idError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);
      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/analytics/diskspace`,
        method: "GET",
        params: buildParams({
          company_id: clientResult.client.getCompanyId(),
          time_span: args.time_span,
          time_zone: args.time_zone,
          from: args.from,
          to: args.to,
        }),
      });
      if (!result.success) return formatError(result.error, "analytics");
      return formatSuccess(result.data);
    }
  );

  const extraAnalytics: [string, string, string][] = [
    ["top-countries", "Top Countries", "Get top visitor countries."],
    ["top-cities", "Top Cities", "Get top visitor cities."],
    ["top-client-ips", "Top Client IPs", "Get top client IP addresses."],
    ["top-asns", "Top ASNs", "Get top autonomous system numbers."],
    ["top-browsers", "Top Browsers", "Get top browsers."],
    ["top-hosts", "Top Hosts", "Get top hosts."],
    ["top-referrers", "Top Referrers", "Get top referrers."],
    ["top-uas", "Top User Agents", "Get top user agents."],
    ["visits-dispersion", "Visit Dispersion", "Get visit dispersion."],
    ["response-codes", "Response Codes", "Get response code breakdown."],
  ];
  for (const [suffix, title, description] of extraAnalytics) {
    registerAnalyticsTool(
      server,
      `kinsta_analytics_${suffix}`,
      title,
      description,
      suffix
    );
  }
}
