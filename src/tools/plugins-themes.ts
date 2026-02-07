import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
} from "./utils.js";

export function registerPluginThemeTools(server: McpServer): void {
  // ---------------------------------------------------------------------------
  // Plugins
  // ---------------------------------------------------------------------------

  server.registerTool(
    "kinsta.plugins.list",
    {
      description: "List all plugins for a Kinsta environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
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
      description:
        "Update a single plugin to the latest version. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        plugin_id: z.string().describe("The plugin ID to update"),
      }),
    },
    async (args, extra) => {
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
      description:
        "Update multiple plugins to their latest versions at once. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        plugin_ids: z.array(z.string()).describe("Array of plugin IDs to update"),
      }),
    },
    async (args, extra) => {
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
      description:
        "List WordPress plugins with details from the WordPress.org repository for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
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
      description: "List all themes for a Kinsta environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
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
      description:
        "Update a single theme to the latest version. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        theme_id: z.string().describe("The theme ID to update"),
      }),
    },
    async (args, extra) => {
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
      description:
        "Update multiple themes to their latest versions at once. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        theme_ids: z.array(z.string()).describe("Array of theme IDs to update"),
      }),
    },
    async (args, extra) => {
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
      description:
        "List WordPress themes with details from the WordPress.org repository for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
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
