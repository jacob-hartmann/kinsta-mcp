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

| Tool          | Description                                          |
| ------------- | ---------------------------------------------------- |
| `kinsta.ping` | Check server status and API credential configuration |

> More tools will be added as Kinsta API endpoints are implemented.

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
