# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Security

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
