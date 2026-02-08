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

export function registerSftpUserTools(server: McpServer): void {
  server.registerTool(
    "kinsta.sftp-users.list",
    {
      title: "List SFTP Users",
      description: "List additional SFTP/SSH user accounts for an environment.",
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
        path: `/sites/environments/${args.env_id}/additional-sftp-accounts`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "SFTP account");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.sftp-users.toggle",
    {
      title: "Toggle SFTP Users",
      description:
        "Enable or disable additional SFTP/SSH accounts for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        is_enabled: z
          .boolean()
          .describe(
            "Whether to enable (true) or disable (false) additional accounts"
          ),
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
        path: `/sites/environments/${args.env_id}/additional-sftp-accounts/toggle`,
        method: "PUT",
        body: { is_enabled: args.is_enabled },
      });

      if (!result.success) return formatError(result.error, "SFTP account");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.sftp-users.add",
    {
      title: "Add SFTP User",
      description:
        "Add a new additional SFTP/SSH user account to an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        username: z.string().describe("Username for the new SFTP account"),
        password: z.string().describe("Password for the new SFTP account"),
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
        path: `/sites/environments/${args.env_id}/additional-sftp-accounts`,
        method: "POST",
        body: {
          username: args.username,
          password: args.password,
        },
      });

      if (!result.success) return formatError(result.error, "SFTP account");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.sftp-users.remove",
    {
      title: "Remove SFTP User",
      description:
        "Remove an additional SFTP/SSH user account from an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        account_id: z.string().describe("The SFTP account ID to remove"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const accountIdError = validateId(args.account_id, "account_id");
      if (accountIdError) return formatValidationError(accountIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/additional-sftp-accounts/${args.account_id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "SFTP account");
      return formatSuccess(result.data);
    }
  );
}
