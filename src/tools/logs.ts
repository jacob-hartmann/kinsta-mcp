import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  formatValidationError,
  buildParams,
  validateId,
} from "./utils.js";

export function registerLogTools(server: McpServer): void {
  server.registerTool(
    "kinsta_logs_get",
    {
      title: "Get Logs",
      description:
        "Get error, access, or Kinsta cache performance logs for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        file_name: z
          .enum(["error", "access", "kinsta-cache-perf"])
          .default("error"),
        lines: z.number().int().min(1).max(20000).default(1000),
        from: z.string().optional().describe("Start timestamp/date filter"),
        to: z.string().optional().describe("End timestamp/date filter"),
        search: z.string().optional().describe("Text to search for"),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const idError = validateId(args.env_id, "env_id");
      if (idError) return formatValidationError(idError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/logs`,
        method: "GET",
        params: buildParams({
          file_name: (args.file_name as string | undefined) ?? "error",
          lines: ((args.lines as number | undefined) ?? 1000).toString(),
          from: args.from,
          to: args.to,
          search: args.search,
        }),
      });

      if (!result.success) return formatError(result.error, "log");
      return formatSuccess(result.data);
    }
  );
}
