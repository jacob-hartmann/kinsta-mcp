import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import { formatAuthError, formatError, formatSuccess } from "./utils.js";

export function registerSiteOperationTools(server: McpServer): void {
  server.registerTool(
    "kinsta_tools_clear-cache",
    {
      title: "Clear Cache",
      description:
        "Clear the server cache for an environment. Returns an operation_id.",
      inputSchema: z.object({
        environment_id: z
          .string()
          .describe("The environment ID to clear cache for"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/sites/tools/clear-cache",
        method: "POST",
        body: { environment_id: args.environment_id },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_tools_restart-php",
    {
      title: "Restart PHP",
      description: "Restart PHP for an environment. Returns an operation_id.",
      inputSchema: z.object({
        environment_id: z
          .string()
          .describe("The environment ID to restart PHP for"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/sites/tools/restart-php",
        method: "POST",
        body: { environment_id: args.environment_id },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_tools_php-version",
    {
      title: "Change PHP Version",
      description:
        "Change the PHP version for an environment. Returns an operation_id.",
      inputSchema: z.object({
        environment_id: z.string().describe("The environment ID"),
        php_version: z
          .string()
          .describe("PHP version to switch to (e.g. 8.1, 8.2, 8.3)"),
        is_opt_out_from_automatic_php_update: z
          .boolean()
          .optional()
          .describe("Opt out of automatic PHP updates"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {
        environment_id: args.environment_id,
        php_version: args.php_version,
      };
      if (args.is_opt_out_from_automatic_php_update !== undefined)
        body["is_opt_out_from_automatic_php_update"] =
          args.is_opt_out_from_automatic_php_update;

      const result = await clientResult.client.request<unknown>({
        path: "/sites/tools/modify-php-version",
        method: "PUT",
        body,
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_tools_denied-ips",
    {
      title: "Get Denied IPs",
      description:
        "Get the list of denied (blocked) IP addresses for an environment.",
      inputSchema: z.object({
        environment_id: z.string().describe("The environment ID"),
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

      const result = await clientResult.client.request<unknown>({
        path: "/sites/tools/denied-ips",
        method: "GET",
        params: { environment_id: args.environment_id },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_tools_denied-ips_update",
    {
      title: "Update Denied IPs",
      description:
        "Update the list of denied (blocked) IP addresses for an environment.",
      inputSchema: z.object({
        environment_id: z.string().describe("The environment ID"),
        ip_list: z.array(z.string()).describe("List of IP addresses to block"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/sites/tools/denied-ips",
        method: "PUT",
        body: {
          environment_id: args.environment_id,
          ip_list: args.ip_list,
        },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_tools_force-https_get",
    {
      title: "Get Force HTTPS Status",
      description: "Get the Force HTTPS status for an environment.",
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
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);
      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/force-https-status`,
        method: "GET",
      });
      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_tools_force-https_set",
    {
      title: "Set Force HTTPS Status",
      description: "Set the Force HTTPS status for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        type: z.enum([
          "ENABLED_FOR_ALL",
          "ENABLED_REDIRECT_TO_PRIMARY",
          "DISABLED",
        ]),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);
      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/force-https-status`,
        method: "POST",
        body: { type: args.type },
      });
      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_tools_search-and-replace",
    {
      title: "Search and Replace",
      description:
        "Preview or perform a database search and replace. perform_replacement defaults to false for a safe preview.",
      inputSchema: z.object({
        environment_id: z.string().describe("The environment ID"),
        search: z.string(),
        replace: z.string(),
        perform_replacement: z.boolean().default(false),
        is_clear_cache: z.boolean().default(false),
      }),
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);
      const result = await clientResult.client.request<unknown>({
        path: "/sites/tools/search-and-replace",
        method: "POST",
        body: {
          environment_id: args.environment_id,
          search: args.search,
          replace: args.replace,
          perform_replacement: args.perform_replacement,
          is_clear_cache: args.is_clear_cache,
        },
      });
      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
}
