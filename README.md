# Kinsta MCP Server

[![CI](https://github.com/jacob-hartmann/kinsta-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/jacob-hartmann/kinsta-mcp/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/jacob-hartmann/kinsta-mcp/badge.svg?branch=main)](https://coveralls.io/github/jacob-hartmann/kinsta-mcp?branch=main)
[![CodeQL](https://github.com/jacob-hartmann/kinsta-mcp/actions/workflows/codeql.yml/badge.svg)](https://github.com/jacob-hartmann/kinsta-mcp/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/jacob-hartmann/kinsta-mcp/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jacob-hartmann/kinsta-mcp)
[![npm version](https://img.shields.io/npm/v/kinsta-mcp)](https://www.npmjs.com/package/kinsta-mcp)
[![npm downloads](https://img.shields.io/npm/dm/kinsta-mcp)](https://www.npmjs.com/package/kinsta-mcp)
[![License](https://img.shields.io/github/license/jacob-hartmann/kinsta-mcp)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for the [Kinsta](https://kinsta.com/) WordPress hosting platform.

This server allows AI assistants (like Claude) to interact with your Kinsta sites and infrastructure securely via the [Kinsta API](https://kinsta.com/docs/kinsta-api/).

It supports MCP 2026-07-28 while remaining compatible with earlier stdio clients.

## Quick Start

### Prerequisites

- Node.js v22 or higher
- A Kinsta account with API access
- A Kinsta API key (see [Generate an API Key](#step-1-generate-a-kinsta-api-key))

### Step 1: Generate a Kinsta API Key

1. Log in to [MyKinsta](https://my.kinsta.com/)
2. Go to **Your name > Company settings > API Keys**
3. Click **Create API Key**
4. Choose an expiration and give the key a name
5. Click **Generate** and copy the key (it's only shown once)

You'll also need your **Company ID**, which can be found in MyKinsta under Company settings.

### Step 2: Configure Your MCP Client

Choose the setup that matches your MCP client:

#### Claude Desktop (Recommended)

Add to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kinsta": {
      "command": "npx",
      "args": ["-y", "kinsta-mcp"],
      "env": {
        "KINSTA_API_KEY": "your-api-key",
        "KINSTA_COMPANY_ID": "your-company-id"
      }
    }
  }
}
```

#### Claude Code (CLI)

Add to your Claude Code MCP settings (`~/.claude/mcp.json` or project-level):

```json
{
  "mcpServers": {
    "kinsta": {
      "command": "npx",
      "args": ["-y", "kinsta-mcp"],
      "env": {
        "KINSTA_API_KEY": "your-api-key",
        "KINSTA_COMPANY_ID": "your-company-id"
      }
    }
  }
}
```

#### Cursor

In Cursor settings, add an MCP server:

```json
{
  "mcpServers": {
    "kinsta": {
      "command": "npx",
      "args": ["-y", "kinsta-mcp"],
      "env": {
        "KINSTA_API_KEY": "your-api-key",
        "KINSTA_COMPANY_ID": "your-company-id"
      }
    }
  }
}
```

## Configuration Reference

### Environment Variables

| Variable              | Required | Default                     | Description                         |
| --------------------- | -------- | --------------------------- | ----------------------------------- |
| `KINSTA_API_KEY`      | Yes      | -                           | Kinsta API key (Bearer token)       |
| `KINSTA_COMPANY_ID`   | Yes      | -                           | Your Kinsta company ID              |
| `KINSTA_API_BASE_URL` | No       | `https://api.kinsta.com/v2` | API base URL (override for testing) |

## Features

### Tools

The server provides **101 tools** covering Kinsta API 1.110.0.

> **Breaking change in 1.1.0:** tool names use underscores instead of dots so
> they work in clients with strict MCP name validation. For example,
> `kinsta.sites.list` is now `kinsta_sites_list`.

#### Connectivity

| Tool          | Description                                          |
| ------------- | ---------------------------------------------------- |
| `kinsta_ping` | Check server status and API credential configuration |

#### Authentication

| Tool                   | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `kinsta_auth_validate` | Validate the current Kinsta API key and return account information if valid |

#### Operations

| Tool                       | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `kinsta_operations_status` | Check the status of an asynchronous Kinsta operation by operation ID |

#### Company

| Tool                           | Description                                                                 |
| ------------------------------ | --------------------------------------------------------------------------- |
| `kinsta_company_users`         | List all users in your Kinsta company                                       |
| `kinsta_company_regions`       | List all available deployment regions for your Kinsta company               |
| `kinsta_company_api-keys`      | List all API keys for your Kinsta company                                   |
| `kinsta_company_activity-logs` | List company activity logs (supports filtering and pagination)              |
| `kinsta_company_plugins`       | List WordPress plugins across all sites (supports search/filter/pagination) |
| `kinsta_company_themes`        | List WordPress themes across all sites (supports search/filter/pagination)  |

#### Sites

| Tool                        | Description                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `kinsta_sites_list`         | List all WordPress sites (optionally include environment details)                       |
| `kinsta_sites_get`          | Get details for a specific Kinsta site by ID                                            |
| `kinsta_sites_create`       | Create a new WordPress site (returns an `operation_id`)                                 |
| `kinsta_sites_create-plain` | Create a new plain (empty) site without WordPress installed (returns an `operation_id`) |
| `kinsta_sites_clone`        | Clone an existing site (returns an `operation_id`)                                      |
| `kinsta_sites_delete`       | Delete a Kinsta site permanently (cannot be undone)                                     |
| `kinsta_sites_reset`        | Reset a site to a fresh WordPress install (destructive)                                 |

#### Environments

| Tool                                          | Description                                                                             |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `kinsta_environments_list`                    | List all environments for a site                                                        |
| `kinsta_environments_create`                  | Create a new WordPress environment for a site (returns an `operation_id`)               |
| `kinsta_environments_create-plain`            | Create a new plain (empty) environment for a site (returns an `operation_id`)           |
| `kinsta_environments_clone`                   | Clone an existing environment (returns an `operation_id`)                               |
| `kinsta_environments_push`                    | Push one environment to another (destructive; returns an `operation_id`)                |
| `kinsta_environments_delete`                  | Delete an environment (cannot be undone)                                                |
| `kinsta_environments_php-allocation`          | Change PHP worker allocation for an environment (returns an `operation_id`)             |
| `kinsta_environments_php-allocation-site`     | Change PHP worker allocation for all environments in a site (returns an `operation_id`) |
| `kinsta_environments_webroot`                 | Change the webroot subfolder for an environment (returns an `operation_id`)             |
| `kinsta_environments_files`                   | List files in an environment's file system                                              |
| `kinsta_environments_redirects`               | List redirect rules for an environment (supports filtering/pagination)                  |
| `kinsta_environments_redirects_update`        | Create, update, or delete redirect rules for an environment                             |
| `kinsta_environments_ssh_status`              | Get SSH/SFTP status for an environment                                                  |
| `kinsta_environments_ssh_toggle`              | Enable or disable SSH/SFTP access for an environment                                    |
| `kinsta_environments_ssh_password-access`     | Enable or disable SSH password-based access                                             |
| `kinsta_environments_ssh_generate-password`   | Generate a new SSH/SFTP password                                                        |
| `kinsta_environments_ssh_password`            | Get the current SSH/SFTP password                                                       |
| `kinsta_environments_ssh_ip-allowlist`        | Get the SSH IP allowlist                                                                |
| `kinsta_environments_ssh_ip-allowlist_update` | Update the SSH IP allowlist                                                             |
| `kinsta_environments_ssh_config`              | Get SSH connection configuration for an environment                                     |
| `kinsta_environments_ssh_password-expiration` | Change SSH password expiration interval                                                 |
| `kinsta_environments_wp-cli`                  | Run a WP-CLI command on an environment (must start with `wp `)                          |
| `kinsta_environments_phpmyadmin`              | Get a phpMyAdmin login token for an environment                                         |
| `kinsta_environments_wpa_login-url`           | Create a WordPress admin login URL for an existing user                                 |
| `kinsta_environments_wpa_create-user`         | Create a WordPress admin user                                                           |
| `kinsta_environments_wpa_user-exists`         | Check whether a WordPress admin user exists                                             |

#### Site Tools

| Tool                              | Description                                                           |
| --------------------------------- | --------------------------------------------------------------------- |
| `kinsta_tools_clear-cache`        | Clear the server cache for an environment (returns an `operation_id`) |
| `kinsta_tools_restart-php`        | Restart PHP for an environment (returns an `operation_id`)            |
| `kinsta_tools_php-version`        | Change the PHP version for an environment (returns an `operation_id`) |
| `kinsta_tools_denied-ips`         | Get the list of denied (blocked) IP addresses for an environment      |
| `kinsta_tools_denied-ips_update`  | Update the list of denied (blocked) IP addresses for an environment   |
| `kinsta_tools_force-https_get`    | Get the Force HTTPS status for an environment                         |
| `kinsta_tools_force-https_set`    | Set the Force HTTPS status for an environment                         |
| `kinsta_tools_search-and-replace` | Preview or perform a database search and replace                      |

#### Plugins & Themes

| Tool                         | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `kinsta_plugins_list`        | List all plugins for an environment                         |
| `kinsta_plugins_update`      | Update a single plugin (returns an `operation_id`)          |
| `kinsta_plugins_bulk-update` | Update multiple plugins at once (returns an `operation_id`) |
| `kinsta_plugins_list-wp`     | List plugins with details from the WordPress.org repository |
| `kinsta_themes_list`         | List all themes for an environment                          |
| `kinsta_themes_update`       | Update a single theme (returns an `operation_id`)           |
| `kinsta_themes_bulk-update`  | Update multiple themes at once (returns an `operation_id`)  |
| `kinsta_themes_list-wp`      | List themes with details from the WordPress.org repository  |

#### Domains

| Tool                          | Description                                |
| ----------------------------- | ------------------------------------------ |
| `kinsta_domains_list`         | List all custom domains for an environment |
| `kinsta_domains_add`          | Add a custom domain to an environment      |
| `kinsta_domains_delete`       | Remove custom domains from an environment  |
| `kinsta_domains_verification` | Get DNS verification records for a domain  |
| `kinsta_domains_set-primary`  | Set the primary domain for an environment  |

#### DNS (Kinsta DNS)

| Tool                        | Description                           |
| --------------------------- | ------------------------------------- |
| `kinsta_dns_domains`        | List all DNS domains for your company |
| `kinsta_dns_records`        | List DNS records for a domain         |
| `kinsta_dns_records_create` | Create a new DNS record               |
| `kinsta_dns_records_update` | Update an existing DNS record         |
| `kinsta_dns_records_delete` | Delete a DNS record                   |

#### Edge Cache & CDN

| Tool                            | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `kinsta_edge-cache_clear`       | Clear the edge cache for an environment (returns an `operation_id`) |
| `kinsta_edge-cache_toggle`      | Enable or disable edge caching for an environment                   |
| `kinsta_cdn_clear-cache`        | Clear the CDN cache for an environment (returns an `operation_id`)  |
| `kinsta_cdn_image-optimization` | Configure CDN image optimization settings                           |

#### SFTP Users

| Tool                       | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `kinsta_sftp-users_list`   | List additional SFTP/SSH user accounts for an environment |
| `kinsta_sftp-users_toggle` | Enable or disable additional SFTP/SSH accounts            |
| `kinsta_sftp-users_add`    | Add a new additional SFTP/SSH user account                |
| `kinsta_sftp-users_remove` | Remove an additional SFTP/SSH user account                |

#### Backups

| Tool                                 | Description                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `kinsta_backups_list`                | List all backups for an environment                                           |
| `kinsta_backups_downloadable`        | List downloadable backups for an environment                                  |
| `kinsta_backups_create`              | Create a manual backup (returns an `operation_id`)                            |
| `kinsta_backups_restore`             | Restore an environment from a backup (destructive; returns an `operation_id`) |
| `kinsta_backups_delete`              | Delete a backup (cannot be undone)                                            |
| `kinsta_backups_create-downloadable` | Create a downloadable backup                                                  |
| `kinsta_backups_next-downloadable`   | Get when the next downloadable backup can be created                          |

#### Analytics

| Tool                                   | Description                                                      |
| -------------------------------------- | ---------------------------------------------------------------- |
| `kinsta_analytics_visits`              | Get visitor analytics for an environment over a date range       |
| `kinsta_analytics_visits-usage`        | Get visitor usage analytics (billable visits)                    |
| `kinsta_analytics_bandwidth`           | Get bandwidth analytics for an environment over a date range     |
| `kinsta_analytics_bandwidth-usage`     | Get bandwidth usage analytics (billable bandwidth)               |
| `kinsta_analytics_cdn-bandwidth`       | Get CDN bandwidth analytics for an environment over a date range |
| `kinsta_analytics_cdn-bandwidth-usage` | Get CDN bandwidth usage analytics (billable CDN bandwidth)       |
| `kinsta_analytics_disk-space`          | Get disk space usage analytics for an environment                |
| `kinsta_analytics_top-countries`       | Get top visitor countries                                        |
| `kinsta_analytics_top-cities`          | Get top visitor cities                                           |
| `kinsta_analytics_top-client-ips`      | Get top client IP addresses                                      |
| `kinsta_analytics_top-asns`            | Get top autonomous system numbers                                |
| `kinsta_analytics_top-browsers`        | Get top browsers                                                 |
| `kinsta_analytics_top-hosts`           | Get top hosts                                                    |
| `kinsta_analytics_top-referrers`       | Get top referrers                                                |
| `kinsta_analytics_top-uas`             | Get top user agents                                              |
| `kinsta_analytics_visits-dispersion`   | Get visit dispersion                                             |
| `kinsta_analytics_response-codes`      | Get response code breakdown                                      |

#### Logs

| Tool              | Description                              |
| ----------------- | ---------------------------------------- |
| `kinsta_logs_get` | Get log file contents for an environment |

### Resources

The server exposes data as MCP resources:

#### Static Resources

| Resource URI       | Description                                     |
| ------------------ | ----------------------------------------------- |
| `kinsta://sites`   | List all WordPress sites in your Kinsta company |
| `kinsta://regions` | List available deployment regions               |

#### Resource Templates

| Resource URI                            | Description                      |
| --------------------------------------- | -------------------------------- |
| `kinsta://sites/{site_id}`              | Details for a specific site      |
| `kinsta://sites/{site_id}/environments` | Environments for a specific site |

### Prompts

The server provides guided prompts for common workflows:

| Prompt             | Description                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| `deploy-site`      | Guide through creating a new WordPress site on Kinsta                  |
| `manage-backups`   | Guide for backup list, create, restore, download, and delete workflows |
| `push-environment` | Guide for pushing changes between environments (e.g. staging to live)  |
| `setup-domain`     | Guide for adding a custom domain to a Kinsta environment               |

## Development

### Setup

```bash
# Clone the repo
git clone https://github.com/jacob-hartmann/kinsta-mcp.git
cd kinsta-mcp

# Use the Node.js version from .nvmrc
# (macOS/Linux nvm): nvm install && nvm use
# (Windows nvm-windows): nvm install 22 && nvm use 22
nvm install
nvm use

# Install dependencies
pnpm install

# Copy .env.example and configure
cp .env.example .env
# Edit .env with your API key and company ID
```

### Running Locally

```bash
# Development mode (auto-reload)
pnpm dev

# Production build
pnpm build

# Production run
pnpm start
```

### Debugging

You can use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to debug the server:

```bash
# Run from source
pnpm inspect

# Run from built output
pnpm inspect:dist
```

`pnpm inspect` loads `.env` automatically via `dotenv` (see `.env.example`).

If you see `Ignored build scripts: esbuild...`, run `pnpm approve-builds` and allow `esbuild`.
In CI we install dependencies with lifecycle scripts disabled (`pnpm install --ignore-scripts`) and then explicitly rebuild only `esbuild` for the production build job.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Security

See [SECURITY.md](./SECURITY.md) for security policy and reporting vulnerabilities.

## Support

This is a community project provided "as is" with **no guaranteed support**. See [SUPPORT.md](./SUPPORT.md) for details.

## License

MIT © Jacob Hartmann
