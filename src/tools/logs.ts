import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  buildParams,
} from "./utils.js";

export function registerLogTools(server: McpServer): void {
  server.registerTool(
    "kinsta.logs.get",
    {
      description:
        "Get log file contents for an environment. Supports error.log and access.log.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        file_name: z
          .string()
          .optional()
          .describe("Log file name (e.g. error.log, access.log)"),
        lines: z
          .number()
          .optional()
          .describe("Number of log lines to return"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/logs`,
        method: "GET",
        params: buildParams({
          file_name: args.file_name,
          lines: args.lines?.toString(),
        }),
      });

      if (!result.success) return formatError(result.error, "log");
      return formatSuccess(result.data);
    }
  );
}
