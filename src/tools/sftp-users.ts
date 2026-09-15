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

export function registerSftpUserTools(server: McpServer): void {
  server.registerTool(
    "kinsta_sftp-users_list",
    {
      title: "List SFTP Users",
      description: "List additional SFTP/SSH user accounts for an environment.",
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
        path: `/sites/environments/${args.env_id}/additional-sftp-accounts`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "SFTP account");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_sftp-users_toggle",
    {
      title: "Toggle SFTP Users",
      description:
        "Enable or disable additional SFTP/SSH accounts for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        enabled: z
          .boolean()
          .describe(
            "Whether to enable (true) or disable (false) additional accounts"
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
        path: `/sites/environments/${args.env_id}/additional-sftp-accounts/toggle-status`,
        method: "PUT",
        body: { enabled: args.enabled },
      });

      if (!result.success) return formatError(result.error, "SFTP account");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_sftp-users_add",
    {
      title: "Add SFTP User",
      description:
        "Add a new additional SFTP/SSH user account to an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        username: z.string().describe("Username for the new SFTP account"),
        password: z
          .string()
          .min(16)
          .describe(
            "Password for the new SFTP account (minimum 16 characters)"
          ),
        root_directory: z.string().optional(),
        permission: z.enum(["read", "write"]).optional(),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/additional-sftp-accounts`,
        method: "POST",
        body: {
          username: args.username,
          password: args.password,
          ...(args.root_directory !== undefined && {
            root_directory: args.root_directory,
          }),
          ...(args.permission !== undefined && { permission: args.permission }),
        },
      });

      if (!result.success) return formatError(result.error, "SFTP account");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_sftp-users_remove",
    {
      title: "Remove SFTP User",
      description:
        "Remove an additional SFTP/SSH user account from an environment.",
      inputSchema: z.object({
        sftp_account_id: z.string().describe("The SFTP account ID to remove"),
      }),
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, ctx) => {
      const accountIdError = validateId(
        args.sftp_account_id,
        "sftp_account_id"
      );
      if (accountIdError) return formatValidationError(accountIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/additional-sftp-accounts/${args.sftp_account_id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "SFTP account");
      return formatSuccess(result.data);
    }
  );
}
