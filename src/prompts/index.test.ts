import { describe, it, expect, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPrompts } from "./index.js";

type PromptHandler = (args: Record<string, string | undefined>) => any;

interface RegisteredPrompt {
  name: string;
  config: any;
  handler: PromptHandler;
}

function setupPrompts() {
  const prompts: RegisteredPrompt[] = [];

  const server = {
    registerPrompt: vi.fn(
      (name: string, config: any, handler: PromptHandler) => {
        prompts.push({ name, config, handler });
      }
    ),
  } as unknown as McpServer;

  registerPrompts(server);
  return { server, prompts };
}

describe("registerPrompts", () => {
  it("should register all 4 prompts", () => {
    const { server } = setupPrompts();
    expect(server.registerPrompt).toHaveBeenCalledTimes(4);
  });

  describe("deploy-site", () => {
    it("should include region when provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "deploy-site")!;

      const result = prompt.handler({
        site_name: "My Site",
        region: "us-east-1",
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("My Site");
      expect(text).toContain("Region: us-east-1");
      expect(text).toContain("Skip");
    });

    it("should ask for region when not provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "deploy-site")!;

      const result = prompt.handler({
        site_name: "My Site",
        region: undefined,
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("My Site");
      expect(text).toContain("Please help me choose a region");
      expect(text).toContain("list available regions");
    });
  });

  describe("manage-backups", () => {
    it("should include env_id in prompt", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "manage-backups")!;

      const result = prompt.handler({ env_id: "env-123" });

      expect(result.messages[0].content.text).toContain("env-123");
    });
  });

  describe("push-environment", () => {
    it("should include site_id in prompt", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "push-environment")!;

      const result = prompt.handler({ site_id: "site-123" });

      expect(result.messages[0].content.text).toContain("site-123");
    });
  });

  describe("setup-domain", () => {
    it("should include env_id and domain in prompt", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "setup-domain")!;

      const result = prompt.handler({
        env_id: "env-123",
        domain: "example.com",
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("env-123");
      expect(text).toContain("example.com");
    });
  });
});
