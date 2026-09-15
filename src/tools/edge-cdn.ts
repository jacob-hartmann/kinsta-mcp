import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  formatValidationError,
  validateId,
} from "./utils.js";

export function registerEdgeCdnTools(server: McpServer): void {
  server.registerTool(
    "kinsta_edge-cache_clear",
    {
      title: "Clear Edge Cache",
      description:
        "Clear the edge cache for an environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        clear_subdirectories: z.boolean().optional(),
        url: z.string().optional(),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/sites/edge-caching/clear",
        method: "POST",
        body: {
          environment_id: args.env_id,
          ...(args.clear_subdirectories !== undefined && {
            clear_subdirectories: args.clear_subdirectories,
          }),
          ...(args.url !== undefined && { url: args.url }),
        },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_edge-cache_toggle",
    {
      title: "Toggle Edge Cache",
      description: "Enable or disable edge caching for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        enabled: z
          .boolean()
          .describe("Whether to enable (true) or disable (false) edge caching"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/sites/edge-caching/status",
        method: "PUT",
        body: { environment_id: args.env_id, enabled: args.enabled },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_cdn_clear-cache",
    {
      title: "Clear CDN Cache",
      description:
        "Clear the CDN cache for an environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        cdn_cache_id: z.string().describe("The CDN cache ID"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/sites/cdn/clear-cache",
        method: "POST",
        body: {
          environment_id: args.env_id,
          cdn_cache_id: args.cdn_cache_id,
        },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_cdn_image-optimization",
    {
      title: "Configure Image Optimization",
      description:
        "Configure CDN image optimization settings for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        image_optimization_type: z
          .union([z.literal(false), z.literal("lossy"), z.literal("lossless")])
          .describe(
            "Disable optimization or select lossy/lossless compression"
          ),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/sites/cdn/image-optimization",
        method: "PUT",
        body: {
          environment_id: args.env_id,
          image_optimization_type: args.image_optimization_type,
        },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
}
