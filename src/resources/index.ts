/**
 * MCP Resources Registration
 *
 * Registers all available resources with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getKinstaClientOrThrow } from "../kinsta/client-factory.js";

/**
 * Register all resources with the MCP server
 */
export function registerResources(server: McpServer): void {
  server.registerResource(
    "sites",
    "kinsta://sites",
    {
      title: "Kinsta Sites",
      description: "List all WordPress sites in your Kinsta company",
    },
    async (_uri, extra) => {
      const client = getKinstaClientOrThrow(extra);
      const companyId = client.getCompanyId();
      const result = await client.request<unknown>({
        path: "/sites",
        method: "GET",
        params: { company: companyId },
      });

      if (!result.success) {
        throw new Error(
          `Kinsta API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: "kinsta://sites",
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "site-details",
    new ResourceTemplate("kinsta://sites/{site_id}", {
      list: async (extra) => {
        const client = getKinstaClientOrThrow(extra);
        const companyId = client.getCompanyId();
        const result = await client.request<{
          company: { sites: { id: string; name: string }[] };
        }>({
          path: "/sites",
          method: "GET",
          params: { company: companyId },
        });

        if (!result.success) return { resources: [] };

        return {
          resources: result.data.company.sites.map((site) => ({
            uri: `kinsta://sites/${site.id}`,
            name: site.name,
          })),
        };
      },
    }),
    {
      title: "Site Details",
      description: "Get details for a specific Kinsta site",
    },
    async (_uri, variables, extra) => {
      const client = getKinstaClientOrThrow(extra);
      const siteId = String(variables["site_id"]);
      const result = await client.request<unknown>({
        path: `/sites/${siteId}`,
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `Kinsta API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: `kinsta://sites/${siteId}`,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "site-environments",
    new ResourceTemplate("kinsta://sites/{site_id}/environments", {
      list: async (extra) => {
        const client = getKinstaClientOrThrow(extra);
        const companyId = client.getCompanyId();
        const result = await client.request<{
          company: { sites: { id: string; name: string }[] };
        }>({
          path: "/sites",
          method: "GET",
          params: { company: companyId },
        });

        if (!result.success) return { resources: [] };

        return {
          resources: result.data.company.sites.map((site) => ({
            uri: `kinsta://sites/${site.id}/environments`,
            name: `${site.name} Environments`,
          })),
        };
      },
    }),
    {
      title: "Site Environments",
      description: "List environments for a Kinsta site",
    },
    async (_uri, variables, extra) => {
      const client = getKinstaClientOrThrow(extra);
      const siteId = String(variables["site_id"]);
      const result = await client.request<unknown>({
        path: `/sites/${siteId}/environments`,
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `Kinsta API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: `kinsta://sites/${siteId}/environments`,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "regions",
    "kinsta://regions",
    {
      title: "Available Regions",
      description: "List available deployment regions",
    },
    async (_uri, extra) => {
      const client = getKinstaClientOrThrow(extra);
      const companyId = client.getCompanyId();
      const result = await client.request<unknown>({
        path: `/company/${companyId}/available-regions`,
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `Kinsta API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: "kinsta://regions",
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );
}
