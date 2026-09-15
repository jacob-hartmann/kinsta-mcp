/**
 * MCP Prompts Registration
 *
 * Registers all available prompts with the MCP server.
 */
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

/**
 * Register all prompts with the MCP server
 */
export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "deploy-site",
    {
      title: "Deploy Site",
      description: "Guide through creating a new WordPress site on Kinsta",
      argsSchema: z.object({
        site_name: z.string().describe("Name for the new site"),
        region: z
          .string()
          .optional()
          .describe("Deployment region (optional, will suggest if omitted)"),
      }),
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
              `1. ${args.region ? "Skip" : "Use kinsta_company_regions to list available regions and help me choose"}\n` +
              `2. Use kinsta_sites_create to create the site with sensible defaults\n` +
              `3. Use kinsta_operations_status to track the creation progress\n` +
              `4. Once complete, use kinsta_sites_get to confirm the site details\n` +
              `5. Share the site URL and any next steps (adding a domain, configuring SSL, etc.)`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "manage-backups",
    {
      title: "Manage Backups",
      description: "Guide for backup list, create, and restore workflows",
      argsSchema: z.object({
        env_id: z.string().describe("The environment ID to manage backups for"),
      }),
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
              `1. Use kinsta_backups_list to show existing backups\n` +
              `2. Ask what I'd like to do:\n` +
              `   - Create a new manual backup (kinsta_backups_create)\n` +
              `   - Restore from a backup (kinsta_backups_restore - confirm first, this is destructive)\n` +
              `   - List downloadable backups (kinsta_backups_downloadable)\n` +
              `   - Create a downloadable backup (kinsta_backups_create-downloadable)\n` +
              `   - Check when the next download is available (kinsta_backups_next-downloadable)\n` +
              `   - Delete a backup (kinsta_backups_delete - confirm first)\n` +
              `3. Track any operations with kinsta_operations_status`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "push-environment",
    {
      title: "Push Environment",
      description:
        "Guide for pushing changes between environments (e.g. staging to live)",
      argsSchema: z.object({
        site_id: z.string().describe("The site ID containing the environments"),
      }),
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
              `1. Use kinsta_environments_list to show available environments\n` +
              `2. Ask which environment to push FROM and which to push TO\n` +
              `3. Ask what to push: database, files, or both\n` +
              `4. IMPORTANT: Confirm the push details before proceeding - this overwrites the target\n` +
              `5. Suggest creating a backup of the target environment first (kinsta_backups_create)\n` +
              `6. Use kinsta_environments_push to execute the push\n` +
              `7. Track the operation with kinsta_operations_status`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "setup-domain",
    {
      title: "Set Up Domain",
      description: "Guide for adding a custom domain to a Kinsta environment",
      argsSchema: z.object({
        env_id: z.string().describe("The environment ID to add the domain to"),
        domain: z.string().describe("The domain name to set up"),
      }),
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
              `1. Use kinsta_domains_list to check existing domains\n` +
              `2. Use kinsta_domains_add to add the domain "${args.domain}"\n` +
              `3. Use kinsta_domains_verification to get DNS verification records\n` +
              `4. Show me the DNS records I need to add at my registrar\n` +
              `5. Once DNS is verified, use kinsta_domains_set-primary if this should be the primary domain\n` +
              `6. Remind me about SSL - Kinsta handles SSL automatically via Let's Encrypt`,
          },
        },
      ],
    })
  );
}
