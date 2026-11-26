# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2026-11-26

This release updates dependencies only. Tools, resources, and prompts are unchanged.

### Security

- Updated `@modelcontextprotocol/server` from 2.0.0 to 2.4.0. This fixes advisories in the MCP TypeScript SDK that affected versions before 2.1.0 and 2.3.0.
- Updated `zod` from 4.6.5 to 4.6.7. This fixes memory exhaustion when validating oversized input.

### Changed

- Updated development tooling (MCP Inspector, Vitest, ESLint, Prettier, typescript-eslint, tsx, Node.js types) and the pinned GitHub Actions.

## [1.1.0] - 2026-09-15

### Added

- 18 tools added in Kinsta API 1.110.0, including WordPress admin, Force HTTPS, search and replace, analytics, and downloadable backups.

### Changed

- Tool names now use MCP-safe underscores instead of dots.
- Updated to MCP 2026-07-28 and refreshed the inspector, test tools, lint tools, and GitHub Actions.
- Updated existing tools to match Kinsta API 1.110.0 paths and request fields.

### Fixed

- Resource names are now accepted by clients with strict MCP name validation.
- Fixed tool discovery in Claude Desktop Chat and Cursor.
- Fixed WordPress plugin, theme, analytics, backup, domain, CDN, SSH, site tool, and log requests.

## [1.0.0] - 2026-02-08

### Added

- 83 MCP tools across 13 categories (connectivity, auth, operations, company, sites, environments, site-tools, plugins & themes, domains, DNS, edge cache & CDN, SFTP users, backups, analytics, logs)
- 6 MCP resources (sites list, site details, site environments, regions)
- 4 guided prompts (deploy-site, manage-backups, push-environment, setup-domain)
- Comprehensive test suite (26 test files covering all tools, resources, prompts, and utilities)
- Client-side caching for Kinsta API client
- Tool titles and detailed descriptions for improved discoverability

### Changed

- Refactored API paths for domain and environment tools
- Enhanced error handling and input validation across all tools
- Improved server instructions for better LLM guidance

### Fixed

- ESLint compatibility with TypeScript (downgraded to 9.x)

### Security

- Updated GitHub Actions dependencies (CodeQL, Harden-Runner, SBOM-Action)
