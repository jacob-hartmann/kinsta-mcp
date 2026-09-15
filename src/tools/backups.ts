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

export function registerBackupTools(server: McpServer): void {
  server.registerTool(
    "kinsta_backups_list",
    {
      title: "List Backups",
      description: "List all backups for an environment.",
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
        path: `/sites/environments/${args.env_id}/backups`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_backups_downloadable",
    {
      title: "List Downloadable Backups",
      description: "List downloadable backups for an environment.",
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
        path: `/sites/environments/${args.env_id}/downloadable-backups`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_backups_create",
    {
      title: "Create Backup",
      description:
        "Create a manual backup for an environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        tag: z
          .string()
          .optional()
          .describe("Optional tag/label for the backup"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {};
      if (args.tag !== undefined) body["tag"] = args.tag;

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/manual-backups`,
        method: "POST",
        body: Object.keys(body).length > 0 ? body : undefined,
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_backups_restore",
    {
      title: "Restore Backup",
      description:
        "Restore an environment from a backup. This will overwrite the current environment. Returns an operation_id.",
      inputSchema: z.object({
        target_env_id: z.string().describe("The environment ID to restore to"),
        backup_id: z.number().int().describe("The backup ID to restore from"),
        notified_user_id: z.string().describe("User ID to notify"),
      }),
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.target_env_id, "target_env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.target_env_id}/backups/restore`,
        method: "POST",
        body: {
          backup_id: args.backup_id,
          notified_user_id: args.notified_user_id,
        },
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_backups_delete",
    {
      title: "Delete Backup",
      description: "Delete a backup. This action cannot be undone.",
      inputSchema: z.object({
        backup_id: z.string().describe("The backup ID to delete"),
      }),
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, ctx) => {
      const backupIdError = validateId(args.backup_id, "backup_id");
      if (backupIdError) return formatValidationError(backupIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/backups/${args.backup_id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_backups_create-downloadable",
    {
      title: "Create Downloadable Backup",
      description: "Create a downloadable backup for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);
      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/downloadable-backups`,
        method: "POST",
      });
      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_backups_next-downloadable",
    {
      title: "Get Next Downloadable Backup Time",
      description:
        "Get when the next downloadable backup can be created for an environment.",
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
        path: `/sites/environments/${args.env_id}/next-downloadable-backup-available`,
        method: "GET",
      });
      if (!result.success) return formatError(result.error, "backup");
      return formatSuccess(result.data);
    }
  );
}
