import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import { formatAuthError, formatError, formatSuccess } from "./utils.js";

export function registerSftpUserTools(server: McpServer): void {
  server.registerTool(
    "kinsta.sftp-users.list",
    {
      description: "List additional SFTP/SSH user accounts for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
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
    },
    async (args, extra) => {
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
      description:
        "Add a new additional SFTP/SSH user account to an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        username: z.string().describe("Username for the new SFTP account"),
        password: z.string().describe("Password for the new SFTP account"),
      }),
    },
    async (args, extra) => {
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
      description:
        "Remove an additional SFTP/SSH user account from an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        account_id: z.string().describe("The SFTP account ID to remove"),
      }),
      annotations: { destructiveHint: true },
    },
    async (args, extra) => {
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
