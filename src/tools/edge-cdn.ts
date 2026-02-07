import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
} from "./utils.js";

export function registerEdgeCdnTools(server: McpServer): void {
  server.registerTool(
    "kinsta.edge-cache.clear",
    {
      description: "Clear the edge cache for an environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/edge-cache/clear`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.edge-cache.toggle",
    {
      description: "Enable or disable edge caching for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        is_enabled: z.boolean().describe("Whether to enable (true) or disable (false) edge caching"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/edge-cache/status`,
        method: "PUT",
        body: { is_enabled: args.is_enabled },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.cdn.clear-cache",
    {
      description: "Clear the CDN cache for an environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/cdn-cache/clear`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.cdn.image-optimization",
    {
      description: "Configure CDN image optimization settings for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        is_enabled: z.boolean().describe("Whether to enable image optimization"),
        is_lossless: z.boolean().optional().describe("Use lossless compression (true) or lossy (false)"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {
        is_enabled: args.is_enabled,
      };
      if (args.is_lossless !== undefined) body["is_lossless"] = args.is_lossless;

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/cdn/image-optimization`,
        method: "PUT",
        body,
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
}
