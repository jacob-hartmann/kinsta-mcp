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

export function registerDomainTools(server: McpServer): void {
  server.registerTool(
    "kinsta_domains_list",
    {
      title: "List Domains",
      description: "List all custom domains for an environment.",
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
        path: `/sites/environments/${args.env_id}/domains`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_domains_add",
    {
      title: "Add Domain",
      description: "Add a custom domain to an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        domain_name: z
          .string()
          .describe("The domain name to add (e.g. example.com)"),
        is_wildcardless: z.boolean().optional(),
        add_with_www_subdomain: z.boolean().optional(),
        setup_type: z.enum(["quick", "avoid_downtime"]).optional(),
        custom_ssl_key: z.string().optional(),
        custom_ssl_cert: z.string().optional(),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/domains`,
        method: "POST",
        body: {
          domain_name: args.domain_name,
          ...(args.is_wildcardless !== undefined && {
            is_wildcardless: args.is_wildcardless,
          }),
          ...(args.add_with_www_subdomain !== undefined && {
            add_with_www_subdomain: args.add_with_www_subdomain,
          }),
          ...(args.setup_type !== undefined && { setup_type: args.setup_type }),
          ...(args.custom_ssl_key !== undefined && {
            custom_ssl_key: args.custom_ssl_key,
          }),
          ...(args.custom_ssl_cert !== undefined && {
            custom_ssl_cert: args.custom_ssl_cert,
          }),
        },
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_domains_delete",
    {
      title: "Delete Domains",
      description: "Remove custom domains from an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        domain_ids: z
          .array(z.string())
          .describe("Array of domain IDs to remove"),
      }),
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/domains`,
        method: "DELETE",
        body: { domain_ids: args.domain_ids },
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_domains_verification",
    {
      title: "Get Domain Verification",
      description: "Get DNS verification records for a domain.",
      inputSchema: z.object({
        site_domain_id: z
          .string()
          .describe("The domain ID to get verification records for"),
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, ctx) => {
      const domainIdError = validateId(args.site_domain_id, "site_domain_id");
      if (domainIdError) return formatValidationError(domainIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/domains/${args.site_domain_id}/verification-records`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );
  server.registerTool(
    "kinsta_domains_set-primary",
    {
      title: "Set Primary Domain",
      description: "Set the primary domain for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        domain_id: z.string().describe("The domain ID to set as primary"),
        run_search_and_replace: z
          .boolean()
          .default(false)
          .describe("Update WordPress URLs after changing the primary domain"),
      }),
      annotations: { openWorldHint: true },
    },
    async (args, ctx) => {
      const envIdError = validateId(args.env_id, "env_id");
      if (envIdError) return formatValidationError(envIdError);
      const clientResult = getKinstaClient(ctx);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/change-primary-domain`,
        method: "PUT",
        body: {
          domain_id: args.domain_id,
          run_search_and_replace:
            (args.run_search_and_replace as boolean | undefined) ?? false,
        },
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );
}
