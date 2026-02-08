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

export function registerPluginThemeTools(server: McpServer): void {
  // ---------------------------------------------------------------------------
  // Plugins
  // ---------------------------------------------------------------------------

  server.registerTool(
    "kinsta.plugins.list",
    {
      title: "List Plugins",
      description: "List all plugins for a Kinsta environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/plugins`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "plugin");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.plugins.update",
    {
      title: "Update Plugin",
      description:
        "Update a single plugin to the latest version. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        plugin_id: z.string().describe("The plugin ID to update"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const pluginIdError = validateId(args.plugin_id, "plugin_id");
      if (pluginIdError) return formatValidationError(pluginIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/plugins/${args.plugin_id}`,
        method: "PUT",
      });

      if (!result.success) return formatError(result.error, "plugin");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.plugins.bulk-update",
    {
      title: "Bulk Update Plugins",
      description:
        "Update multiple plugins to their latest versions at once. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        plugin_ids: z
          .array(z.string())
          .describe("Array of plugin IDs to update"),
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
        path: `/sites/environments/${args.env_id}/plugins/bulk-update`,
        method: "PUT",
        body: { plugin_ids: args.plugin_ids },
      });

      if (!result.success) return formatError(result.error, "plugin");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.plugins.list-wp",
    {
      title: "List WordPress Plugins",
      description:
        "List WordPress plugins with details from the WordPress.org repository for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/wordpress-plugins`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "plugin");
      return formatSuccess(result.data);
    }
  );

  // ---------------------------------------------------------------------------
  // Themes
  // ---------------------------------------------------------------------------

  server.registerTool(
    "kinsta.themes.list",
    {
      title: "List Themes",
      description: "List all themes for a Kinsta environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/themes`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "theme");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.themes.update",
    {
      title: "Update Theme",
      description:
        "Update a single theme to the latest version. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        theme_id: z.string().describe("The theme ID to update"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const themeIdError = validateId(args.theme_id, "theme_id");
      if (themeIdError) return formatValidationError(themeIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/themes/${args.theme_id}`,
        method: "PUT",
      });

      if (!result.success) return formatError(result.error, "theme");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.themes.bulk-update",
    {
      title: "Bulk Update Themes",
      description:
        "Update multiple themes to their latest versions at once. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        theme_ids: z.array(z.string()).describe("Array of theme IDs to update"),
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
        path: `/sites/environments/${args.env_id}/themes/bulk-update`,
        method: "PUT",
        body: { theme_ids: args.theme_ids },
      });

      if (!result.success) return formatError(result.error, "theme");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.themes.list-wp",
    {
      title: "List WordPress Themes",
      description:
        "List WordPress themes with details from the WordPress.org repository for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/wordpress-themes`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "theme");
      return formatSuccess(result.data);
    }
  );
}
