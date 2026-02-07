import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPingTool } from "./ping.js";

// Mock the auth module
vi.mock("../kinsta/auth.js", () => ({
  isKinstaConfigured: vi.fn(),
}));

import { isKinstaConfigured } from "../kinsta/auth.js";

describe("kinsta.ping tool", () => {
  let server: McpServer;
  let registeredTools: Map<
    string,
    {
      description: string;
      handler: (params: Record<string, unknown>, extra: unknown) => unknown;
    }
  >;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock server that captures registered tools
    registeredTools = new Map();
    server = {
      registerTool: vi.fn(
        (
          name: string,
          config: { description: string },
          handler: (params: Record<string, unknown>, extra: unknown) => unknown
        ) => {
          registeredTools.set(name, {
            description: config.description,
            handler,
          });
        }
      ),
    } as unknown as McpServer;

    registerPingTool(server);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should register the kinsta.ping tool", () => {
    expect(server.registerTool).toHaveBeenCalledTimes(1);
    expect(registeredTools.has("kinsta.ping")).toBe(true);
  });

  it("should return success when credentials are configured", () => {
    vi.mocked(isKinstaConfigured).mockReturnValue(true);

    const tool = registeredTools.get("kinsta.ping");
    expect(tool).toBeDefined();
    if (!tool) return;

    const result = tool.handler({}, {}) as {
      isError?: boolean;
      content: { type: string; text?: string }[];
    };

    expect(result.isError).toBeUndefined();
    const text = result.content.find((c) => c.type === "text")?.text ?? "";
    expect(text).toContain("running");
    expect(text).toContain("configured");
  });

  it("should return error when credentials are not configured", () => {
    vi.mocked(isKinstaConfigured).mockReturnValue(false);

    const tool = registeredTools.get("kinsta.ping");
    expect(tool).toBeDefined();
    if (!tool) return;

    const result = tool.handler({}, {}) as {
      isError?: boolean;
      content: { type: string; text?: string }[];
    };

    expect(result.isError).toBe(true);
    const text = result.content.find((c) => c.type === "text")?.text ?? "";
    expect(text).toContain("not configured");
    expect(text).toContain("KINSTA_API_KEY");
    expect(text).toContain("KINSTA_COMPANY_ID");
  });
});
