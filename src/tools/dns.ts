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

export function registerDnsTools(server: McpServer): void {
  server.registerTool(
    "kinsta_dns_domains",
    {
      title: "List DNS Domains",
      description: "List all DNS domains for your Kinsta company.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_args, ctx) => {
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: "/domains",
        method: "GET",
        params: { company: companyId },
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_dns_records",
    {
      title: "List DNS Records",
      description: "List all DNS records for a specific domain.",
      inputSchema: z.object({
        domain_id: z.string().describe("The domain ID to list DNS records for"),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const idError = validateId(args.domain_id, "domain_id");
      if (idError) return formatValidationError(idError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/domains/${args.domain_id}/dns-records`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "DNS record");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_dns_records_create",
    {
      title: "Create DNS Record",
      description: "Create a new DNS record for a domain.",
      inputSchema: z.object({
        domain_id: z.string().describe("The domain ID to create a record for"),
        type: z
          .string()
          .describe("DNS record type (e.g. A, AAAA, CNAME, MX, TXT, SRV)"),
        name: z.string().describe("DNS record name (e.g. @ or subdomain)"),
        ttl: z
          .number()
          .min(300)
          .describe("Time to live in seconds (minimum 300)"),
        resource_records: z
          .array(z.object({ value: z.string().describe("Record value") }))
          .describe("Array of resource record values"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const idError = validateId(args.domain_id, "domain_id");
      if (idError) return formatValidationError(idError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/domains/${args.domain_id}/dns-records`,
        method: "POST",
        body: {
          type: args.type,
          name: args.name,
          ttl: args.ttl,
          resource_records: args.resource_records,
        },
      });

      if (!result.success) return formatError(result.error, "DNS record");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_dns_records_update",
    {
      title: "Update DNS Record",
      description: "Update an existing DNS record for a domain.",
      inputSchema: z.object({
        domain_id: z.string().describe("The domain ID containing the record"),
        type: z
          .string()
          .describe("DNS record type (e.g. A, AAAA, CNAME, MX, TXT, SRV)"),
        name: z.string().describe("DNS record name to update"),
        ttl: z
          .number()
          .min(300)
          .optional()
          .describe("New TTL in seconds (minimum 300)"),
        new_resource_records: z
          .array(z.object({ value: z.string().describe("Record value") }))
          .optional()
          .describe("New resource records to add"),
        removed_resource_records: z
          .array(z.object({ value: z.string().describe("Record value") }))
          .optional()
          .describe("Resource records to remove"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const idError = validateId(args.domain_id, "domain_id");
      if (idError) return formatValidationError(idError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {
        type: args.type,
        name: args.name,
      };
      if (args.ttl !== undefined) body["ttl"] = args.ttl;
      if (args.new_resource_records !== undefined)
        body["new_resource_records"] = args.new_resource_records;
      if (args.removed_resource_records !== undefined)
        body["removed_resource_records"] = args.removed_resource_records;

      const result = await clientResult.client.request<unknown>({
        path: `/domains/${args.domain_id}/dns-records`,
        method: "PUT",
        body,
      });

      if (!result.success) return formatError(result.error, "DNS record");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_dns_records_delete",
    {
      title: "Delete DNS Record",
      description: "Delete a DNS record from a domain.",
      inputSchema: z.object({
        domain_id: z.string().describe("The domain ID containing the record"),
        type: z.string().describe("DNS record type to delete"),
        name: z.string().describe("DNS record name to delete"),
      }),
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, ctx) => {
      const idError = validateId(args.domain_id, "domain_id");
      if (idError) return formatValidationError(idError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/domains/${args.domain_id}/dns-records`,
        method: "DELETE",
        body: {
          type: args.type,
          name: args.name,
        },
      });

      if (!result.success) return formatError(result.error, "DNS record");
      return formatSuccess(result.data);
    }
  );
}
