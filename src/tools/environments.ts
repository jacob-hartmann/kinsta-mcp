import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getKinstaClient } from "../kinsta/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  buildParams,
} from "./utils.js";

export function registerEnvironmentTools(server: McpServer): void {
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  server.registerTool(
    "kinsta.environments.list",
    {
      description: "List all environments for a Kinsta site.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID to list environments for"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}/environments`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.create",
    {
      description:
        "Create a new WordPress environment for a site. Returns an operation_id.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID to create the environment for"),
        display_name: z.string().describe("Display name for the environment"),
        site_title: z.string().describe("WordPress site title"),
        is_premium: z.boolean().describe("Whether this is a premium staging environment"),
        admin_email: z.string().describe("WordPress admin email"),
        admin_password: z.string().describe("WordPress admin password"),
        admin_user: z.string().describe("WordPress admin username"),
        wp_language: z.string().describe("WordPress language code (e.g. en_US)"),
        is_multisite: z.boolean().optional().describe("Create as multisite"),
        is_subdomain_multisite: z.boolean().optional().describe("Use subdomain-based multisite"),
        woocommerce: z.boolean().optional().describe("Install WooCommerce"),
        wordpress_plugin_edd: z.boolean().optional().describe("Install Easy Digital Downloads"),
        wordpressseo: z.boolean().optional().describe("Install Yoast SEO"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {
        display_name: args.display_name,
        site_title: args.site_title,
        is_premium: args.is_premium,
        admin_email: args.admin_email,
        admin_password: args.admin_password,
        admin_user: args.admin_user,
        wp_language: args.wp_language,
      };
      if (args.is_multisite !== undefined) body["is_multisite"] = args.is_multisite;
      if (args.is_subdomain_multisite !== undefined)
        body["is_subdomain_multisite"] = args.is_subdomain_multisite;
      if (args.woocommerce !== undefined) body["woocommerce"] = args.woocommerce;
      if (args.wordpress_plugin_edd !== undefined)
        body["wordpress_plugin_edd"] = args.wordpress_plugin_edd;
      if (args.wordpressseo !== undefined) body["wordpressseo"] = args.wordpressseo;

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}/environments`,
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.create-plain",
    {
      description:
        "Create a new plain (empty) environment for a site. Returns an operation_id.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID to create the environment for"),
        display_name: z.string().describe("Display name for the environment"),
        is_premium: z.boolean().describe("Whether this is a premium staging environment"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}/environments/plain`,
        method: "POST",
        body: {
          display_name: args.display_name,
          is_premium: args.is_premium,
        },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.clone",
    {
      description:
        "Clone an existing environment to create a new one. Returns an operation_id.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID to create the environment for"),
        display_name: z.string().describe("Display name for the cloned environment"),
        is_premium: z.boolean().describe("Whether this is a premium staging environment"),
        source_env_id: z.string().describe("Source environment ID to clone from"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}/environments/clone`,
        method: "POST",
        body: {
          display_name: args.display_name,
          is_premium: args.is_premium,
          source_env_id: args.source_env_id,
        },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.push",
    {
      description:
        "Push one environment to another (e.g. staging to live). Returns an operation_id.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID"),
        source_env_id: z.string().describe("Source environment ID to push from"),
        target_env_id: z.string().describe("Target environment ID to push to"),
        push_db: z.boolean().optional().describe("Push the database"),
        push_files: z.boolean().optional().describe("Push files"),
        run_search_and_replace: z.boolean().optional().describe("Run search and replace on the database"),
        push_files_option: z
          .enum(["ALL_FILES", "SPECIFIC_FILES"])
          .optional()
          .describe("Which files to push"),
        file_list: z
          .array(z.string())
          .optional()
          .describe("List of specific files to push (when push_files_option is SPECIFIC_FILES)"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {
        source_env_id: args.source_env_id,
        target_env_id: args.target_env_id,
      };
      if (args.push_db !== undefined) body["push_db"] = args.push_db;
      if (args.push_files !== undefined) body["push_files"] = args.push_files;
      if (args.run_search_and_replace !== undefined)
        body["run_search_and_replace"] = args.run_search_and_replace;
      if (args.push_files_option !== undefined)
        body["push_files_option"] = args.push_files_option;
      if (args.file_list !== undefined) body["file_list"] = args.file_list;

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}/environments`,
        method: "PUT",
        body,
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.delete",
    {
      description: "Delete an environment. This action cannot be undone.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID to delete"),
      }),
      annotations: { destructiveHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  // ---------------------------------------------------------------------------
  // PHP & Configuration
  // ---------------------------------------------------------------------------

  server.registerTool(
    "kinsta.environments.php-allocation",
    {
      description:
        "Change PHP worker allocation for a specific environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        thread_count: z.number().describe("Number of PHP worker threads"),
        thread_memory: z.number().describe("Memory per PHP worker thread in MB"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/change-environment-php-allocation`,
        method: "POST",
        body: {
          thread_count: args.thread_count,
          thread_memory: args.thread_memory,
        },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.php-allocation-site",
    {
      description:
        "Change PHP worker allocation for all environments in a site. Returns an operation_id.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID"),
        thread_count: z.number().describe("Number of PHP worker threads"),
        thread_memory: z.number().describe("Memory per PHP worker thread in MB"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}/change-site-php-allocation`,
        method: "POST",
        body: {
          thread_count: args.thread_count,
          thread_memory: args.thread_memory,
        },
      });

      if (!result.success) return formatError(result.error, "site");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.webroot",
    {
      description:
        "Change the webroot subfolder for an environment. Returns an operation_id.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        web_root_subfolder: z.string().describe("New webroot subfolder path"),
        clear_all_cache: z.boolean().optional().describe("Clear all caches after change"),
        refresh_plugins_and_themes: z.boolean().optional().describe("Refresh plugins and themes after change"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {
        web_root_subfolder: args.web_root_subfolder,
      };
      if (args.clear_all_cache !== undefined)
        body["clear_all_cache"] = args.clear_all_cache;
      if (args.refresh_plugins_and_themes !== undefined)
        body["refresh_plugins_and_themes"] = args.refresh_plugins_and_themes;

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/change-webroot-subfolder`,
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  // ---------------------------------------------------------------------------
  // Files & Redirects
  // ---------------------------------------------------------------------------

  server.registerTool(
    "kinsta.environments.files",
    {
      description: "List files in an environment's file system.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/file-list`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.redirects",
    {
      description: "List redirect rules for an environment. Supports filtering and pagination.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        limit: z.number().optional().describe("Number of results to return"),
        offset: z.number().optional().describe("Offset for pagination"),
        key: z.string().optional().describe("Sort key"),
        order: z.string().optional().describe("Sort order (asc or desc)"),
        search_query: z.string().optional().describe("Search term to filter redirects"),
        regex_search: z.boolean().optional().describe("Whether to use regex for search"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/redirect-rules`,
        method: "GET",
        params: buildParams({
          limit: args.limit?.toString(),
          offset: args.offset?.toString(),
          key: args.key,
          order: args.order,
          search_query: args.search_query,
          regex_search: args.regex_search?.toString(),
        }),
      });

      if (!result.success) return formatError(result.error, "redirect");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.redirects.update",
    {
      description:
        "Create, update, or delete redirect rules for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        action_type: z
          .enum(["DELETE", "DELETE_ALL", "NEW", "UPDATE"])
          .describe("Action to perform on redirect rules"),
        rules_to_update: z
          .array(z.record(z.string(), z.unknown()))
          .optional()
          .describe("Rules to update or delete"),
        new_value: z.record(z.string(), z.unknown()).optional().describe("New redirect rule to create"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = {
        action_type: args.action_type,
      };
      if (args.rules_to_update !== undefined)
        body["rules_to_update"] = args.rules_to_update;
      if (args.new_value !== undefined) body["new_value"] = args.new_value;

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/redirect-rules`,
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "redirect");
      return formatSuccess(result.data);
    }
  );

  // ---------------------------------------------------------------------------
  // SFTP/SSH
  // ---------------------------------------------------------------------------

  server.registerTool(
    "kinsta.environments.ssh.status",
    {
      description: "Get the SSH/SFTP status for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/ssh/get-status`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.ssh.toggle",
    {
      description: "Enable or disable SSH/SFTP access for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        is_enabled: z.boolean().describe("Whether to enable (true) or disable (false) SSH"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/ssh/set-status`,
        method: "POST",
        body: { is_enabled: args.is_enabled },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.ssh.password-access",
    {
      description: "Enable or disable SSH password-based access for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        is_enabled: z.boolean().describe("Whether to enable (true) or disable (false) password access"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/ssh/set-password-status`,
        method: "POST",
        body: { is_enabled: args.is_enabled },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.ssh.generate-password",
    {
      description: "Generate a new SSH/SFTP password for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/ssh/generate-password`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.ssh.password",
    {
      description: "Get the current SSH/SFTP password for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/ssh/password`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.ssh.ip-allowlist",
    {
      description: "Get the SSH IP allowlist for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/ssh/get-allowed-ips`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.ssh.ip-allowlist.update",
    {
      description: "Update the SSH IP allowlist for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        ip_allowlist: z.array(z.string()).describe("List of IP addresses to allow SSH access"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/ssh/set-allowed-ips`,
        method: "POST",
        body: { ip_allowlist: args.ip_allowlist },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.ssh.config",
    {
      description: "Get SSH connection configuration for an environment.",
      inputSchema: z.object({
        site_id: z.string().describe("The site ID"),
        env_id: z.string().describe("The environment ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/${args.site_id}/environments/${args.env_id}/ssh/config`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.ssh.password-expiration",
    {
      description: "Change the SSH password expiration interval for an environment.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        exp_interval: z.number().describe("Password expiration interval in seconds"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/ssh/change-expiration-interval`,
        method: "POST",
        body: { exp_interval: args.exp_interval },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  // ---------------------------------------------------------------------------
  // WP-CLI & phpMyAdmin
  // ---------------------------------------------------------------------------

  server.registerTool(
    "kinsta.environments.wp-cli",
    {
      description:
        "Run a WP-CLI command on an environment. The command must start with 'wp '.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
        wp_command: z.string().describe("WP-CLI command to run (must start with 'wp ')"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/run-wp-cli-command`,
        method: "POST",
        body: { wp_command: args.wp_command },
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );

  server.registerTool(
    "kinsta.environments.phpmyadmin",
    {
      description:
        "Get a phpMyAdmin login token for an environment to access the database.",
      inputSchema: z.object({
        env_id: z.string().describe("The environment ID"),
      }),
    },
    async (args, extra) => {
      const clientResult = getKinstaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/sites/environments/${args.env_id}/pma-login-token`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "environment");
      return formatSuccess(result.data);
    }
  );
}
