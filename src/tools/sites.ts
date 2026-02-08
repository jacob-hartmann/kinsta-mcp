import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  formatValidationError,
  buildParams,
  kinstaOutputSchema,
  validateId,
} from "./utils.js";

export function registerSiteTools(server: McpServer): void {
  server.registerTool(
    "kinsta.sites.list",
    {
      title: "List Sites",
      description:
        "List all WordPress sites in your Kinsta company. Optionally include environment details.",
      inputSchema: z.object({
        include_environments: z
          .boolean()
          .optional()
          .describe("Include environment details for each site"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: "/sites",
        method: "GET",
        params: buildParams({
          company: companyId,
          include_environments: args.include_environments?.toString(),
        }),
      });

      if (!result.success) return formatError(result.error, "site");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.sites.get",
    {
      title: "Get Site",
      description: "Get details for a specific Kinsta site by its ID.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID to retrieve"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const idError = validateId(args.site_id, "site_id");
      if (idError) return formatValidationError(idError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "site");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.sites.create",
    {
      title: "Create Site",
      description:
        "Create a new WordPress site on Kinsta. Returns an operation_id to track progress.",
      inputSchema: z.object({
        display_name: z.string().describe("Display name for the new site"),
        region: z
          .string()
          .describe(
            "Deployment region (use kinsta.company.regions to list available regions)"
          ),
        admin_email: z.string().describe("WordPress admin email"),
        admin_password: z.string().describe("WordPress admin password"),
        admin_user: z.string().describe("WordPress admin username"),
        site_title: z.string().describe("WordPress site title"),
        wp_language: z
          .string()
          .describe("WordPress language code (e.g. en_US)"),
        is_multisite: z
          .boolean()
          .optional()
          .describe("Create as WordPress multisite"),
        is_subdomain_multisite: z
          .boolean()
          .optional()
          .describe("Use subdomain-based multisite"),
        woocommerce: z.boolean().optional().describe("Install WooCommerce"),
        wordpressseo: z.boolean().optional().describe("Install Yoast SEO"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const body: Record<string, unknown> = {
        company: companyId,
        display_name: args.display_name,
        region: args.region,
        admin_email: args.admin_email,
        admin_password: args.admin_password,
        admin_user: args.admin_user,
        site_title: args.site_title,
        wp_language: args.wp_language,
      };
      if (args.is_multisite !== undefined)
        body["is_multisite"] = args.is_multisite;
      if (args.is_subdomain_multisite !== undefined)
        body["is_subdomain_multisite"] = args.is_subdomain_multisite;
      if (args.woocommerce !== undefined)
        body["woocommerce"] = args.woocommerce;
      if (args.wordpressseo !== undefined)
        body["wordpressseo"] = args.wordpressseo;

      const result = await clientResult.client.request<unknown>({
        path: "/sites",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "site");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.sites.create-plain",
    {
      title: "Create Plain Site",
      description:
        "Create a new plain (empty) site on Kinsta without WordPress installed. Returns an operation_id.",
      inputSchema: z.object({
        display_name: z.string().describe("Display name for the new site"),
        region: z.string().describe("Deployment region"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: "/sites/plain",
        method: "POST",
        body: {
          company: companyId,
          display_name: args.display_name,
          region: args.region,
        },
      });

      if (!result.success) return formatError(result.error, "site");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.sites.clone",
    {
      title: "Clone Site",
      description:
        "Clone an existing site to create a new site. Returns an operation_id.",
      inputSchema: z.object({
        display_name: z.string().describe("Display name for the cloned site"),
        source_env_id: z
          .string()
          .describe("Source environment ID to clone from"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = clientResult.client.getCompanyId();
      const result = await clientResult.client.request<unknown>({
        path: "/sites/clone",
        method: "POST",
        body: {
          company: companyId,
          display_name: args.display_name,
          source_env_id: args.source_env_id,
        },
      });

      if (!result.success) return formatError(result.error, "site");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.sites.delete",
    {
      title: "Delete Site",
      description:
        "Delete a Kinsta site permanently. This action cannot be undone.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID to delete"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, extra) => {
      const idError = validateId(args.site_id, "site_id");
      if (idError) return formatValidationError(idError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "site");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.sites.reset",
    {
      title: "Reset Site",
      description:
        "Reset a Kinsta site to a fresh WordPress install. This removes all existing data.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID to reset"),
        admin_password: z
          .string()
          .describe("New WordPress admin password after reset"),
      }),
      outputSchema: kinstaOutputSchema,
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async (args, extra) => {
      const idError = validateId(args.site_id, "site_id");
      if (idError) return formatValidationError(idError);

      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}/reset`,
        method: "POST",
        body: {
          admin_password: args.admin_password,
        },
      });

      if (!result.success) return formatError(result.error, "site");
      return formatSuccess(result.data);
    }
  );
}
