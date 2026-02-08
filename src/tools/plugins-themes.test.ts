import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerPluginThemeTools } from "./plugins-themes.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Plugin & Theme Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerPluginThemeTools(ctx.server);
  });

  it("should register all 8 tools", () => {
    const names = [
      "kinsta.plugins.list",
      "kinsta.plugins.update",
      "kinsta.plugins.bulk-update",
      "kinsta.plugins.list-wp",
      "kinsta.themes.list",
      "kinsta.themes.update",
      "kinsta.themes.bulk-update",
      "kinsta.themes.list-wp",
    ];
    for (const name of names) {
      expect(ctx.tools.has(name)).toBe(true);
    }
  });

  // --- Plugins ---
  describe("kinsta.plugins.list", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.plugins.list", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.plugins.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.plugins.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { plugins: [] });
      const result = await ctx.callTool("kinsta.plugins.list", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/plugins",
          method: "GET",
        })
      );
    });
  });

  describe("kinsta.plugins.update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.plugins.update", {
        env_id: "../bad",
        plugin_id: "p1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should validate plugin_id", async () => {
      const result = await ctx.callTool("kinsta.plugins.update", {
        env_id: "env-1",
        plugin_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Invalid plugin_id");
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.plugins.update", {
        env_id: "env-1",
        plugin_id: "p1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.plugins.update", {
        env_id: "env-1",
        plugin_id: "p1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/plugins/p1",
          method: "PUT",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.plugins.update", {
        env_id: "env-1",
        plugin_id: "p1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.plugins.bulk-update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.plugins.bulk-update", {
        env_id: "../bad",
        plugin_ids: ["p1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.plugins.bulk-update", {
        env_id: "env-1",
        plugin_ids: ["p1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.plugins.bulk-update", {
        env_id: "env-1",
        plugin_ids: ["p1", "p2"],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/plugins/bulk-update",
          method: "PUT",
          body: { plugin_ids: ["p1", "p2"] },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.plugins.bulk-update", {
        env_id: "env-1",
        plugin_ids: ["p1"],
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.plugins.list-wp", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.plugins.list-wp", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.plugins.list-wp", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { plugins: [] });
      const result = await ctx.callTool("kinsta.plugins.list-wp", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/wordpress-plugins",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.plugins.list-wp", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  // --- Themes ---
  describe("kinsta.themes.list", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.themes.list", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.themes.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.themes.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { themes: [] });
      const result = await ctx.callTool("kinsta.themes.list", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/themes",
          method: "GET",
        })
      );
    });
  });

  describe("kinsta.themes.update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.themes.update", {
        env_id: "../bad",
        theme_id: "t1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should validate theme_id", async () => {
      const result = await ctx.callTool("kinsta.themes.update", {
        env_id: "env-1",
        theme_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Invalid theme_id");
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.themes.update", {
        env_id: "env-1",
        theme_id: "t1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.themes.update", {
        env_id: "env-1",
        theme_id: "t1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/themes/t1",
          method: "PUT",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.themes.update", {
        env_id: "env-1",
        theme_id: "t1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.themes.bulk-update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.themes.bulk-update", {
        env_id: "../bad",
        theme_ids: ["t1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.themes.bulk-update", {
        env_id: "env-1",
        theme_ids: ["t1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.themes.bulk-update", {
        env_id: "env-1",
        theme_ids: ["t1", "t2"],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/themes/bulk-update",
          method: "PUT",
          body: { theme_ids: ["t1", "t2"] },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.themes.bulk-update", {
        env_id: "env-1",
        theme_ids: ["t1"],
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.themes.list-wp", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.themes.list-wp", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.themes.list-wp", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { themes: [] });
      const result = await ctx.callTool("kinsta.themes.list-wp", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/wordpress-themes",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.themes.list-wp", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
