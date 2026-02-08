import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import { formatAuthError, formatError, formatSuccess } from "./utils.js";

export function registerOperationTools(server: McpServer): void {
  server.registerTool(
    "kinsta.operations.status",
    {
      description:
        "Check the status of an asynchronous Kinsta operation by its operation ID. " +
        "Many Kinsta actions (site creation, backups, cache clearing, etc.) return an operation_id " +
        "that can be polled here to track progress.",
      inputSchema: z.object({
        operation_id: z
          .string()
          .describe("The operation ID to check status for"),
      }),
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/operations/${args.operation_id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "operation");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.auth.validate",
    {
      description:
        "Validate the current Kinsta API key. Returns account information if the key is valid.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
      },
    },
    async (_args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/validate",
        method: "GET",
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );
}
