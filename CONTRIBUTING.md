# Contributing to Kinsta MCP

Thank you for your interest in contributing to the Kinsta MCP server! This document provides guidelines for setting up your development environment and contributing to the project.

## Development Setup

### Prerequisites

- **Node.js**: v22 LTS or higher
- **pnpm**: v10 or higher
- **Kinsta Account**: You'll need a Kinsta account to generate an API key for testing

### Initial Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/jacob-hartmann/kinsta-mcp.git
   cd kinsta-mcp
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure environment**:
   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Add your Kinsta API key:

   ```text
   KINSTA_API_KEY=your-api-key-here
   KINSTA_COMPANY_ID=your-company-id-here
   ```

## Development Workflow

### Scripts

- **`pnpm dev`**: Watch mode for development. Rebuilds on file changes.
- **`pnpm build`**: Build the project for production.
- **`pnpm test`**: Run tests.
- **`pnpm test:watch`**: Run tests in watch mode.
- **`pnpm lint`**: Run ESLint.
- **`pnpm format`**: Format code with Prettier.
- **`pnpm check`**: Run all quality checks (types, lint, format, test).

### Testing

We use [Vitest](https://vitest.dev/) for testing. Please ensure all tests pass before submitting a pull request.

```bash
pnpm test
```

### Linting and Formatting

We use ESLint and Prettier to maintain code quality and consistency.

```bash
# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

## Project Structure

- **`src/`**: Source code
  - **`kinsta/`**: Kinsta API client and types
  - **`tools/`**: MCP tools (functions callable by LLMs)
  - **`resources/`**: MCP resources (data accessible to LLMs)
  - **`prompts/`**: MCP prompts (templates for LLMs)
- **`dist/`**: Compiled output

## Coding Standards

1. **TypeScript**: We use strict TypeScript. No `any` types unless absolutely necessary.
2. **Error Handling**: Use the `KinstaClientError` class for API errors. Handle rate limits and auth errors gracefully.
3. **Logging**: All logging must go to `stderr` (using `console.error`). `stdout` is reserved for the MCP protocol JSON-RPC messages.
4. **Commits**: Write clear, descriptive commit messages.

## Opening Issues

When opening an issue, please use one of the provided issue templates:

- **Bug Report**: For reporting bugs or unexpected behavior
- **Feature Request**: For suggesting new features or enhancements
- **Question**: For asking questions about usage

These templates help ensure you provide all the necessary information for us to understand and address your issue effectively.

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Implement your changes.
3. Add tests for any new functionality.
4. Run `pnpm check` to ensure all quality checks pass.
5. Update `CHANGELOG.md` if your changes are user-facing (see [RELEASING.md](./RELEASING.md) for guidance).
6. Submit a Pull Request using the provided template.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
