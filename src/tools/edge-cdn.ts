import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  formatValidationError,
  kinstaOutputSchema,
  validateId,
} from "./utils.js";

export function registerEdgeCdnTools(server: McpServer): void {
  server.registerTool(
    "kinsta.edge-cache.clear",
    {
      title: "Clear Edge Cache",
      description:
        "Clear the edge cache for an environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);

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
      title: "Toggle Edge Cache",
      description: "Enable or disable edge caching for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        is_enabled: z
          .boolean()
          .describe("Whether to enable (true) or disable (false) edge caching"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);

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
      title: "Clear CDN Cache",
      description:
        "Clear the CDN cache for an environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);

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
      title: "Configure Image Optimization",
      description:
        "Configure CDN image optimization settings for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        is_enabled: z
          .boolean()
          .describe("Whether to enable image optimization"),
        is_lossless: z
          .boolean()
          .optional()
          .describe("Use lossless compression (true) or lossy (false)"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {
        is_enabled: args.is_enabled,
      };
      if (args.is_lossless !== undefined)
        body["is_lossless"] = args.is_lossless;

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
