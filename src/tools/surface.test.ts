import { describe, expect, it, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/server";
import { registerTools } from "./index.js";

describe("MCP tool surface", () => {
  it("registers 101 unique MCP-safe tool names", () => {
    const names: string[] = [];
    const server = {
      registerTool: vi.fn((name: string) => names.push(name)),
    } as unknown as McpServer;

    registerTools(server);

    expect(names).toHaveLength(101);
    expect(new Set(names).size).toBe(101);
    for (const name of names) {
      expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/);
      expect(name).not.toContain(".");
    }
  });
});
