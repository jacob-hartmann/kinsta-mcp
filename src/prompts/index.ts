/**
 * MCP Prompts Registration
 *
 * Registers all available prompts with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register all prompts with the MCP server
 */
export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "deploy-site",
    {
      description: "Guide through creating a new WordPress site on Kinsta",
      argsSchema: {
        site_name: z.string().describe("Name for the new site"),
        region: z
          .string()
          .optional()
          .describe("Deployment region (optional, will suggest if omitted)"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me create a new WordPress site on Kinsta.\n\n` +
              `Site name: ${args.site_name}\n` +
              `${args.region ? `Region: ${args.region}\n` : "Please help me choose a region.\n"}\n` +
              `Steps:\n` +
              `1. ${args.region ? "Skip" : "Use kinsta.company.regions to list available regions and help me choose"}\n` +
              `2. Use kinsta.sites.create to create the site with sensible defaults\n` +
              `3. Use kinsta.operations.status to track the creation progress\n` +
              `4. Once complete, use kinsta.sites.get to confirm the site details\n` +
              `5. Share the site URL and any next steps (adding a domain, configuring SSL, etc.)`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "manage-backups",
    {
      description: "Guide for backup list, create, and restore workflows",
      argsSchema: {
        env_id: z.string().describe("The environment ID to manage backups for"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me manage backups for environment ${args.env_id}.\n\n` +
              `Steps:\n` +
              `1. Use kinsta.backups.list to show existing backups\n` +
              `2. Ask what I'd like to do:\n` +
              `   - Create a new manual backup (kinsta.backups.create)\n` +
              `   - Restore from a backup (kinsta.backups.restore - confirm first, this is destructive)\n` +
              `   - Download a backup (kinsta.backups.downloadable)\n` +
              `   - Delete a backup (kinsta.backups.delete - confirm first)\n` +
              `3. Track any operations with kinsta.operations.status`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "push-environment",
    {
      description:
        "Guide for pushing changes between environments (e.g. staging to live)",
      argsSchema: {
        site_id: z.string().describe("The site ID containing the environments"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me push changes between environments for site ${args.site_id}.\n\n` +
              `Steps:\n` +
              `1. Use kinsta.environments.list to show available environments\n` +
              `2. Ask which environment to push FROM and which to push TO\n` +
              `3. Ask what to push: database, files, or both\n` +
              `4. IMPORTANT: Confirm the push details before proceeding - this overwrites the target\n` +
              `5. Suggest creating a backup of the target environment first (kinsta.backups.create)\n` +
              `6. Use kinsta.environments.push to execute the push\n` +
              `7. Track the operation with kinsta.operations.status`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "setup-domain",
    {
      description: "Guide for adding a custom domain to a Kinsta environment",
      argsSchema: {
        env_id: z.string().describe("The environment ID to add the domain to"),
        domain: z.string().describe("The domain name to set up"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me set up the domain "${args.domain}" for environment ${args.env_id}.\n\n` +
              `Steps:\n` +
              `1. Use kinsta.domains.list to check existing domains\n` +
              `2. Use kinsta.domains.add to add the domain "${args.domain}"\n` +
              `3. Use kinsta.domains.verification to get DNS verification records\n` +
              `4. Show me the DNS records I need to add at my registrar\n` +
              `5. Once DNS is verified, use kinsta.domains.set-primary if this should be the primary domain\n` +
              `6. Remind me about SSL - Kinsta handles SSL automatically via Let's Encrypt`,
          },
        },
      ],
    })
  );
}
