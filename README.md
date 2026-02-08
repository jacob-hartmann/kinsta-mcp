# Kinsta MCP Server

[![CI](https://github.com/jacob-hartmann/kinsta-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/jacob-hartmann/kinsta-mcp/actions/workflows/ci.yml)
[![CodeQL](https://github.com/jacob-hartmann/kinsta-mcp/actions/workflows/codeql.yml/badge.svg)](https://github.com/jacob-hartmann/kinsta-mcp/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/jacob-hartmann/kinsta-mcp/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jacob-hartmann/kinsta-mcp)
[![npm version](https://img.shields.io/npm/v/kinsta-mcp)](https://www.npmjs.com/package/kinsta-mcp)
[![License](https://img.shields.io/github/license/jacob-hartmann/kinsta-mcp)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for the [Kinsta](https://kinsta.com/) WordPress hosting platform.

This server allows AI assistants (like Claude) to interact with your Kinsta sites and infrastructure securely via the [Kinsta API](https://kinsta.com/docs/kinsta-api/).

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

The server provides **83 tools** organized by category:

#### Connectivity

| Tool          | Description                                          |
| ------------- | ---------------------------------------------------- |
| `kinsta.ping` | Check server status and API credential configuration |

#### Authentication

| Tool                   | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `kinsta.auth.validate` | Validate the current Kinsta API key and return account information if valid |

#### Operations

| Tool                       | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `kinsta.operations.status` | Check the status of an asynchronous Kinsta operation by operation ID |

#### Company

| Tool                           | Description                                                                 |
| ------------------------------ | --------------------------------------------------------------------------- |
| `kinsta.company.users`         | List all users in your Kinsta company                                       |
| `kinsta.company.regions`       | List all available deployment regions for your Kinsta company               |
| `kinsta.company.api-keys`      | List all API keys for your Kinsta company                                   |
| `kinsta.company.activity-logs` | List company activity logs (supports filtering and pagination)              |
| `kinsta.company.plugins`       | List WordPress plugins across all sites (supports search/filter/pagination) |
| `kinsta.company.themes`        | List WordPress themes across all sites (supports search/filter/pagination)  |

#### Sites

| Tool                        | Description                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `kinsta.sites.list`         | List all WordPress sites (optionally include environment details)                       |
| `kinsta.sites.get`          | Get details for a specific Kinsta site by ID                                            |
| `kinsta.sites.create`       | Create a new WordPress site (returns an `operation_id`)                                 |
| `kinsta.sites.create-plain` | Create a new plain (empty) site without WordPress installed (returns an `operation_id`) |
| `kinsta.sites.clone`        | Clone an existing site (returns an `operation_id`)                                      |
| `kinsta.sites.delete`       | Delete a Kinsta site permanently (cannot be undone)                                     |
| `kinsta.sites.reset`        | Reset a site to a fresh WordPress install (destructive)                                 |

#### Environments

| Tool                                          | Description                                                                             |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `kinsta.environments.list`                    | List all environments for a site                                                        |
| `kinsta.environments.create`                  | Create a new WordPress environment for a site (returns an `operation_id`)               |
| `kinsta.environments.create-plain`            | Create a new plain (empty) environment for a site (returns an `operation_id`)           |
| `kinsta.environments.clone`                   | Clone an existing environment (returns an `operation_id`)                               |
| `kinsta.environments.push`                    | Push one environment to another (destructive; returns an `operation_id`)                |
| `kinsta.environments.delete`                  | Delete an environment (cannot be undone)                                                |
| `kinsta.environments.php-allocation`          | Change PHP worker allocation for an environment (returns an `operation_id`)             |
| `kinsta.environments.php-allocation-site`     | Change PHP worker allocation for all environments in a site (returns an `operation_id`) |
| `kinsta.environments.webroot`                 | Change the webroot subfolder for an environment (returns an `operation_id`)             |
| `kinsta.environments.files`                   | List files in an environment's file system                                              |
| `kinsta.environments.redirects`               | List redirect rules for an environment (supports filtering/pagination)                  |
| `kinsta.environments.redirects.update`        | Create, update, or delete redirect rules for an environment                             |
| `kinsta.environments.ssh.status`              | Get SSH/SFTP status for an environment                                                  |
| `kinsta.environments.ssh.toggle`              | Enable or disable SSH/SFTP access for an environment                                    |
| `kinsta.environments.ssh.password-access`     | Enable or disable SSH password-based access                                             |
| `kinsta.environments.ssh.generate-password`   | Generate a new SSH/SFTP password                                                        |
| `kinsta.environments.ssh.password`            | Get the current SSH/SFTP password                                                       |
| `kinsta.environments.ssh.ip-allowlist`        | Get the SSH IP allowlist                                                                |
| `kinsta.environments.ssh.ip-allowlist.update` | Update the SSH IP allowlist                                                             |
| `kinsta.environments.ssh.config`              | Get SSH connection configuration for an environment                                     |
| `kinsta.environments.ssh.password-expiration` | Change SSH password expiration interval                                                 |
| `kinsta.environments.wp-cli`                  | Run a WP-CLI command on an environment (must start with `wp `)                          |
| `kinsta.environments.phpmyadmin`              | Get a phpMyAdmin login token for an environment                                         |

#### Site Tools

| Tool                             | Description                                                           |
| -------------------------------- | --------------------------------------------------------------------- |
| `kinsta.tools.clear-cache`       | Clear the server cache for an environment (returns an `operation_id`) |
| `kinsta.tools.restart-php`       | Restart PHP for an environment (returns an `operation_id`)            |
| `kinsta.tools.php-version`       | Change the PHP version for an environment (returns an `operation_id`) |
| `kinsta.tools.denied-ips`        | Get the list of denied (blocked) IP addresses for an environment      |
| `kinsta.tools.denied-ips.update` | Update the list of denied (blocked) IP addresses for an environment   |

#### Plugins & Themes

| Tool                         | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `kinsta.plugins.list`        | List all plugins for an environment                         |
| `kinsta.plugins.update`      | Update a single plugin (returns an `operation_id`)          |
| `kinsta.plugins.bulk-update` | Update multiple plugins at once (returns an `operation_id`) |
| `kinsta.plugins.list-wp`     | List plugins with details from the WordPress.org repository |
| `kinsta.themes.list`         | List all themes for an environment                          |
| `kinsta.themes.update`       | Update a single theme (returns an `operation_id`)           |
| `kinsta.themes.bulk-update`  | Update multiple themes at once (returns an `operation_id`)  |
| `kinsta.themes.list-wp`      | List themes with details from the WordPress.org repository  |

#### Domains

| Tool                          | Description                                |
| ----------------------------- | ------------------------------------------ |
| `kinsta.domains.list`         | List all custom domains for an environment |
| `kinsta.domains.add`          | Add a custom domain to an environment      |
| `kinsta.domains.delete`       | Remove custom domains from an environment  |
| `kinsta.domains.verification` | Get DNS verification records for a domain  |
| `kinsta.domains.set-primary`  | Set the primary domain for an environment  |

#### DNS (Kinsta DNS)

| Tool                        | Description                           |
| --------------------------- | ------------------------------------- |
| `kinsta.dns.domains`        | List all DNS domains for your company |
| `kinsta.dns.records`        | List DNS records for a domain         |
| `kinsta.dns.records.create` | Create a new DNS record               |
| `kinsta.dns.records.update` | Update an existing DNS record         |
| `kinsta.dns.records.delete` | Delete a DNS record                   |

#### Edge Cache & CDN

| Tool                            | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `kinsta.edge-cache.clear`       | Clear the edge cache for an environment (returns an `operation_id`) |
| `kinsta.edge-cache.toggle`      | Enable or disable edge caching for an environment                   |
| `kinsta.cdn.clear-cache`        | Clear the CDN cache for an environment (returns an `operation_id`)  |
| `kinsta.cdn.image-optimization` | Configure CDN image optimization settings                           |

#### SFTP Users

| Tool                       | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `kinsta.sftp-users.list`   | List additional SFTP/SSH user accounts for an environment |
| `kinsta.sftp-users.toggle` | Enable or disable additional SFTP/SSH accounts            |
| `kinsta.sftp-users.add`    | Add a new additional SFTP/SSH user account                |
| `kinsta.sftp-users.remove` | Remove an additional SFTP/SSH user account                |

#### Backups

| Tool                          | Description                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `kinsta.backups.list`         | List all backups for an environment                                           |
| `kinsta.backups.downloadable` | List downloadable backups for an environment                                  |
| `kinsta.backups.create`       | Create a manual backup (returns an `operation_id`)                            |
| `kinsta.backups.restore`      | Restore an environment from a backup (destructive; returns an `operation_id`) |
| `kinsta.backups.delete`       | Delete a backup (cannot be undone)                                            |

#### Analytics

| Tool                                   | Description                                                      |
| -------------------------------------- | ---------------------------------------------------------------- |
| `kinsta.analytics.visits`              | Get visitor analytics for an environment over a date range       |
| `kinsta.analytics.visits-usage`        | Get visitor usage analytics (billable visits)                    |
| `kinsta.analytics.bandwidth`           | Get bandwidth analytics for an environment over a date range     |
| `kinsta.analytics.bandwidth-usage`     | Get bandwidth usage analytics (billable bandwidth)               |
| `kinsta.analytics.cdn-bandwidth`       | Get CDN bandwidth analytics for an environment over a date range |
| `kinsta.analytics.cdn-bandwidth-usage` | Get CDN bandwidth usage analytics (billable CDN bandwidth)       |
| `kinsta.analytics.disk-space`          | Get disk space usage analytics for an environment                |

#### Logs

| Tool              | Description                              |
| ----------------- | ---------------------------------------- |
| `kinsta.logs.get` | Get log file contents for an environment |

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
