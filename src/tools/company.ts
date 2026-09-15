import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  buildParams,
} from "./utils.js";

export function registerCompanyTools(server: McpServer): void {
  server.registerTool(
    "kinsta_company_users",
    {
      title: "List Company Users",
      description: "List all users in your Kinsta company.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: `/company/${companyId}/users`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_company_regions",
    {
      title: "List Available Regions",
      description:
        "List all available deployment regions for your Kinsta company.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: `/company/${companyId}/available-regions`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_company_api-keys",
    {
      title: "List API Keys",
      description: "List all API keys for your Kinsta company.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: `/company/${companyId}/api-keys`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_company_activity-logs",
    {
      title: "List Activity Logs",
      description:
        "List activity logs for your Kinsta company. Supports filtering and pagination.",
      inputSchema: z.object({
        limit: z.number().optional().describe("Number of results to return"),
        offset: z.number().optional().describe("Offset for pagination"),
        category: z
          .enum([
            "siteActions",
            "kinstaDns",
            "migrations",
            "billing",
            "notifications",
            "userManagement",
            "personalSettings",
            "samlSso",
          ])
          .optional()
          .describe("Filter by activity category"),
        site_id: z.string().optional().describe("Filter by site ID"),
        id_initiated_by: z
          .string()
          .optional()
          .describe("Filter by user ID who initiated the action"),
        id_api_key: z.string().optional().describe("Filter by API key ID"),
        language: z
          .enum(["da", "de", "en", "es", "fr", "it", "ja", "nl", "pt", "sv"])
          .optional()
          .describe("Language for log messages"),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: `/company/${companyId}/activity-logs`,
        method: "GET",
        params: buildParams({
          limit: args.limit?.toString(),
          offset: args.offset?.toString(),
          category: args.category,
          site_id: args.site_id,
          id_initiated_by: args.id_initiated_by,
          id_api_key: args.id_api_key,
          language: args.language,
        }),
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_company_plugins",
    {
      title: "List Company Plugins",
      description:
        "List all WordPress plugins across all sites in your Kinsta company. Supports search, filtering, and pagination.",
      inputSchema: z.object({
        offset: z.number().optional().describe("Offset for pagination"),
        limit: z.number().optional().describe("Number of results to return"),
        search: z.string().optional().describe("Search term to filter plugins"),
        status: z
          .enum(["active", "inactive"])
          .optional()
          .describe("Filter by plugin status (e.g. active, inactive)"),
        column: z
          .enum(["vulnerable", "updatesAvailable"])
          .optional()
          .describe("Column filter"),
        order_by: z
          .object({
            field: z.enum(["name", "environments", "updates"]),
            order: z.enum(["ascend", "descend"]),
          })
          .optional()
          .describe("Sort configuration"),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: `/company/${companyId}/wp-plugins`,
        method: "GET",
        params: buildParams({
          offset: args.offset?.toString(),
          limit: args.limit?.toString(),
          search: args.search,
          status: args.status,
          column: args.column,
          order_by: args.order_by ? JSON.stringify(args.order_by) : undefined,
        }),
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_company_themes",
    {
      title: "List Company Themes",
      description:
        "List all WordPress themes across all sites in your Kinsta company. Supports search, filtering, and pagination.",
      inputSchema: z.object({
        offset: z.number().optional().describe("Offset for pagination"),
        limit: z.number().optional().describe("Number of results to return"),
        search: z.string().optional().describe("Search term to filter themes"),
        status: z
          .enum(["active", "inactive"])
          .optional()
          .describe("Filter by theme status (e.g. active, inactive)"),
        column: z
          .enum(["vulnerable", "updatesAvailable"])
          .optional()
          .describe("Column filter"),
        order_by: z
          .object({
            field: z.enum(["name", "environments", "updates"]),
            order: z.enum(["ascend", "descend"]),
          })
          .optional()
          .describe("Sort configuration"),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: `/company/${companyId}/wp-themes`,
        method: "GET",
        params: buildParams({
          offset: args.offset?.toString(),
          limit: args.limit?.toString(),
          search: args.search,
          status: args.status,
          column: args.column,
          order_by: args.order_by ? JSON.stringify(args.order_by) : undefined,
        }),
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );
}
