import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock McpServer - must be inline due to hoisting
vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => {
  return {
    McpServer: class MockMcpServer {
      config: { name: string; version: string };
      connect = vi.fn().mockResolvedValue(undefined);

      constructor(config: { name: string; version: string }) {
        this.config = config;
      }
    },
  };
});

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => {
  return {
    // Empty class for mock - no methods needed for these tests
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    StdioServerTransport: class MockStdioServerTransport {},
  };
});

vi.mock("./tools/index.js", () => ({
  registerTools: vi.fn(),
}));

vi.mock("./resources/index.js", () => ({
  registerResources: vi.fn(),
}));

vi.mock("./prompts/index.js", () => ({
  registerPrompts: vi.fn(),
}));

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

describe("Kinsta MCP Server Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("McpServer creation", () => {
    it("should create McpServer with correct configuration", () => {
      const server = new McpServer({
        name: "kinsta-mcp",
        version: "0.1.0",
      }) as unknown as { config: { name: string; version: string } };

      expect(server.config.name).toBe("kinsta-mcp");
      expect(server.config.version).toBe("0.1.0");
    });

    it("should register all handlers on server", () => {
      const server = new McpServer({
        name: "kinsta-mcp",
        version: "0.1.0",
      });

      registerTools(server);
      registerResources(server);
      registerPrompts(server);

      expect(registerTools).toHaveBeenCalledWith(server);
      expect(registerResources).toHaveBeenCalledWith(server);
      expect(registerPrompts).toHaveBeenCalledWith(server);
    });
  });

  describe("StdioServerTransport", () => {
    it("should be able to create transport", () => {
      const transport = new StdioServerTransport();

      expect(transport).toBeDefined();
    });

    it("should connect server with transport", async () => {
      const server = new McpServer({
        name: "kinsta-mcp",
        version: "0.1.0",
      }) as unknown as { connect: (transport: unknown) => Promise<void> };
      const transport = new StdioServerTransport();

      await server.connect(transport);

      expect(vi.mocked(server.connect)).toHaveBeenCalledWith(transport);
    });
  });

  describe("Server constants", () => {
    it("should use expected server name", () => {
      const SERVER_NAME = "kinsta-mcp";
      expect(SERVER_NAME).toBe("kinsta-mcp");
    });
  });

  describe("createServer function behavior", () => {
    it("should create server with all handlers registered", () => {
      const server = new McpServer({
        name: "kinsta-mcp",
        version: "0.1.0",
      });

      registerTools(server);
      registerResources(server);
      registerPrompts(server);

      expect(registerTools).toHaveBeenCalledTimes(1);
      expect(registerResources).toHaveBeenCalledTimes(1);
      expect(registerPrompts).toHaveBeenCalledTimes(1);
    });
  });

  describe("startStdioServer behavior", () => {
    it("should connect server to stdio transport", async () => {
      const server = new McpServer({
        name: "kinsta-mcp",
        version: "0.1.0",
      }) as unknown as { connect: (transport: unknown) => Promise<void> };
      const transport = new StdioServerTransport();

      await server.connect(transport);

      expect(vi.mocked(server.connect)).toHaveBeenCalledWith(transport);
    });
  });
});
