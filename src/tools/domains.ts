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

export function registerDomainTools(server: McpServer): void {
  server.registerTool(
    "kinsta.domains.list",
    {
      title: "List Domains",
      description: "List all custom domains for an environment.",
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
        path: `/environments/${args.env_id}/domains`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.domains.add",
    {
      title: "Add Domain",
      description: "Add a custom domain to an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        domain_name: z
          .string()
          .describe("The domain name to add (e.g. example.com)"),
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
        path: `/environments/${args.env_id}/domains`,
        method: "POST",
        body: { domain_name: args.domain_name },
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.domains.delete",
    {
      title: "Delete Domains",
      description: "Remove custom domains from an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        domain_ids: z
          .array(z.string())
          .describe("Array of domain IDs to remove"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, extra) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/environments/${args.env_id}/domains`,
        method: "DELETE",
        body: { domain_ids: args.domain_ids },
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.domains.verification",
    {
      title: "Get Domain Verification",
      description: "Get DNS verification records for a domain.",
      inputSchema: z.object({
        domain_id: z
          .string()
          .describe("The domain ID to get verification records for"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const domainIdError = validateId(args.domain_id, "domain_id");
      if (domainIdError) return formatValidationError(domainIdError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/domains/${args.domain_id}/verification-records`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.domains.set-primary",
    {
      title: "Set Primary Domain",
      description: "Set the primary domain for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        domain_id: z.string().describe("The domain ID to set as primary"),
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
        path: `/environments/${args.env_id}/primary-domain`,
        method: "PUT",
        body: { domain_id: args.domain_id },
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );
}
