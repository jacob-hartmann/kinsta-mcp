import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import { formatAuthError, formatError, formatSuccess } from "./utils.js";

export function registerBackupTools(server: McpServer): void {
  server.registerTool(
    "kinsta.backups.list",
    {
      description: "List all backups for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/backups`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.backups.downloadable",
    {
      description: "List downloadable backups for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/backups/downloadable`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.backups.create",
    {
      description:
        "Create a manual backup for an environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        tag: z
          .string()
          .optional()
          .describe("Optional tag/label for the backup"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {};
      if (args.tag !== undefined) body["tag"] = args.tag;

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/backups/manual`,
        method: "POST",
        body: Object.keys(body).length > 0 ? body : undefined,
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.backups.restore",
    {
      description:
        "Restore an environment from a backup. This will overwrite the current environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID to restore to"),
        backup_id: z.string().describe("The backup ID to restore from"),
      }),
      annotations: { destructiveHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/backups/restore`,
        method: "POST",
        body: { backup_id: args.backup_id },
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.backups.delete",
    {
      description: "Delete a backup. This action cannot be undone.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        backup_id: z.string().describe("The backup ID to delete"),
      }),
      annotations: { destructiveHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/backups/${args.backup_id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );
}
