import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  kinstaOutputSchema,
  validateId,
  formatValidationError,
} from "./utils.js";

export function registerOperationTools(server: McpServer): void {
  server.registerTool(
    "kinsta.operations.status",
    {
      title: "Check Operation Status",
      description:
        "Check the status of an asynchronous Kinsta operation by its operation ID. " +
        "Many Kinsta actions (site creation, backups, cache clearing, etc.) return an operation_id " +
        "that can be polled here to track progress.",
      inputSchema: z.object({
        operation_id: z
          .string()
          .describe("The operation ID to check status for"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const idError = validateId(args.operation_id, "operation_id");
      if (idError) return formatValidationError(idError);

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
      title: "Validate API Key",
      description:
        "Validate the current Kinsta API key. Returns account information if the key is valid.",
      inputSchema: z.object({}),
      outputSchema: kinstaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/validate",
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "auth");
      return formatSuccess(result.data);
    }
  );
}
