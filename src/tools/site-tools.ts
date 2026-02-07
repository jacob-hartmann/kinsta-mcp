import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
} from "./utils.js";

export function registerSiteOperationTools(server: McpServer): void {
  server.registerTool(
    "kinsta.tools.clear-cache",
    {
      description:
        "Clear the server cache for an environment. Returns an operation_id.",
      inputSchema: z.object({
        environment_id: z.string().describe("The environment ID to clear cache for"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
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
    "kinsta.tools.restart-php",
    {
      description:
        "Restart PHP for an environment. Returns an operation_id.",
      inputSchema: z.object({
        environment_id: z.string().describe("The environment ID to restart PHP for"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
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
    "kinsta.tools.php-version",
    {
      description:
        "Change the PHP version for an environment. Returns an operation_id.",
      inputSchema: z.object({
        environment_id: z.string().describe("The environment ID"),
        php_version: z.string().describe("PHP version to switch to (e.g. 8.1, 8.2, 8.3)"),
        is_opt_out_from_automatic_php_update: z
          .boolean()
          .optional()
          .describe("Opt out of automatic PHP updates"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
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
    "kinsta.tools.denied-ips",
    {
      description: "Get the list of denied (blocked) IP addresses for an environment.",
      inputSchema: z.object({
        environment_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
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
    "kinsta.tools.denied-ips.update",
    {
      description: "Update the list of denied (blocked) IP addresses for an environment.",
      inputSchema: z.object({
        environment_id: z.string().describe("The environment ID"),
        ip_list: z.array(z.string()).describe("List of IP addresses to block"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
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
}
