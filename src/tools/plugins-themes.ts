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

export function registerPluginThemeTools(server: McpServer): void {
  // ---------------------------------------------------------------------------
  // Plugins
  // ---------------------------------------------------------------------------
  server.registerTool(
    "kinsta_plugins_list",
    {
      title: "List Plugins",
      description: "List all plugins for a Kinsta environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
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
    "kinsta_plugins_update",
    {
      title: "Update Plugin",
      description:
        "Update a single plugin to the latest version. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        name: z.string().describe("The plugin name/slug to update"),
        update_version: z.string().describe("The plugin version to install"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/plugins`,
        method: "PUT",
        body: { name: args.name, update_version: args.update_version },
      });

      if (!result.success) return formatError(result.error, "plugin");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_plugins_bulk-update",
    {
      title: "Bulk Update Plugins",
      description:
        "Update multiple plugins to their latest versions at once. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        plugins: z
          .array(z.object({ name: z.string() }))
          .describe("Plugins to update, identified by name/slug"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/plugins/bulk-update`,
        method: "PUT",
        body: { plugins: args.plugins },
      });

      if (!result.success) return formatError(result.error, "plugin");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_plugins_list-wp",
    {
      title: "List WordPress Plugins",
      description:
        "List WordPress plugins with details from the WordPress.org repository for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        status: z.enum(["active", "inactive"]).optional(),
        column: z.enum(["vulnerable", "updatesAvailable"]).optional(),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/wp-plugins`,
        method: "GET",
        params: buildParams({ status: args.status, column: args.column }),
      });

      if (!result.success) return formatError(result.error, "plugin");
      return formatSuccess(result.data);
    }
  );

  // ---------------------------------------------------------------------------
  // Themes
  // ---------------------------------------------------------------------------
  server.registerTool(
    "kinsta_themes_list",
    {
      title: "List Themes",
      description: "List all themes for a Kinsta environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
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
    "kinsta_themes_update",
    {
      title: "Update Theme",
      description:
        "Update a single theme to the latest version. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        name: z.string().describe("The theme name/slug to update"),
        update_version: z.string().describe("The theme version to install"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/themes`,
        method: "PUT",
        body: { name: args.name, update_version: args.update_version },
      });

      if (!result.success) return formatError(result.error, "theme");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_themes_bulk-update",
    {
      title: "Bulk Update Themes",
      description:
        "Update multiple themes to their latest versions at once. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        themes: z
          .array(z.object({ name: z.string() }))
          .describe("Themes to update, identified by name/slug"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/themes/bulk-update`,
        method: "PUT",
        body: { themes: args.themes },
      });

      if (!result.success) return formatError(result.error, "theme");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_themes_list-wp",
    {
      title: "List WordPress Themes",
      description:
        "List WordPress themes with details from the WordPress.org repository for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        status: z.enum(["active", "inactive"]).optional(),
        column: z.enum(["vulnerable", "updatesAvailable"]).optional(),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/wp-themes`,
        method: "GET",
        params: buildParams({ status: args.status, column: args.column }),
      });

      if (!result.success) return formatError(result.error, "theme");
      return formatSuccess(result.data);
    }
  );
}
