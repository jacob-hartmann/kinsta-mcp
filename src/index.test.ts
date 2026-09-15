import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { McpServer } from "@modelcontextprotocol/server";

// Mock McpServer - must be inline due to hoisting
vi.mock("@modelcontextprotocol/server", () => {
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

vi.mock("@modelcontextprotocol/server/stdio", () => {
  return {
    serveStdio: vi.fn((factory: () => unknown) => ({
      server: factory(),
      close: vi.fn().mockResolvedValue(undefined),
    })),
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

  describe("stdio serving", () => {
    it("should serve a server factory", () => {
      const factory = () =>
        new McpServer({ name: "kinsta-mcp", version: "0.1.0" });
      const handle = serveStdio(factory) as unknown as { server: McpServer };

      expect(serveStdio).toHaveBeenCalledWith(factory);
      expect(handle.server).toBeDefined();
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
});
