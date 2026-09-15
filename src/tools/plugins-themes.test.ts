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
      "kinsta_plugins_list",
      "kinsta_plugins_update",
      "kinsta_plugins_bulk-update",
      "kinsta_plugins_list-wp",
      "kinsta_themes_list",
      "kinsta_themes_update",
      "kinsta_themes_bulk-update",
      "kinsta_themes_list-wp",
    ];
    for (const name of names) {
      expect(ctx.tools.has(name)).toBe(true);
    }
  });

  // --- Plugins ---
  describe("kinsta_plugins_list", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_plugins_list", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_plugins_list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_plugins_list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { plugins: [] });
      const result = await ctx.callTool("kinsta_plugins_list", {
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

  describe("kinsta_plugins_update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_plugins_update", {
        env_id: "../bad",
        plugin_id: "p1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_plugins_update", {
        env_id: "env-1",
        name: "akismet",
        update_version: "5.3",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta_plugins_update", {
        env_id: "env-1",
        name: "akismet",
        update_version: "5.3",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/plugins",
          method: "PUT",
          body: { name: "akismet", update_version: "5.3" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta_plugins_update", {
        env_id: "env-1",
        name: "akismet",
        update_version: "5.3",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_plugins_bulk-update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_plugins_bulk-update", {
        env_id: "../bad",
        plugin_ids: ["p1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_plugins_bulk-update", {
        env_id: "env-1",
        plugin_ids: ["p1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta_plugins_bulk-update", {
        env_id: "env-1",
        plugins: [{ name: "akismet" }, { name: "hello-dolly" }],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/plugins/bulk-update",
          method: "PUT",
          body: { plugins: [{ name: "akismet" }, { name: "hello-dolly" }] },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_plugins_bulk-update", {
        env_id: "env-1",
        plugin_ids: ["p1"],
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_plugins_list-wp", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_plugins_list-wp", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_plugins_list-wp", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { plugins: [] });
      const result = await ctx.callTool("kinsta_plugins_list-wp", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/wp-plugins",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_plugins_list-wp", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  // --- Themes ---
  describe("kinsta_themes_list", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_themes_list", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_themes_list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_themes_list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { themes: [] });
      const result = await ctx.callTool("kinsta_themes_list", {
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

  describe("kinsta_themes_update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_themes_update", {
        env_id: "../bad",
        theme_id: "t1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_themes_update", {
        env_id: "env-1",
        name: "twentytwentysix",
        update_version: "1.2",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta_themes_update", {
        env_id: "env-1",
        name: "twentytwentysix",
        update_version: "1.2",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/themes",
          method: "PUT",
          body: { name: "twentytwentysix", update_version: "1.2" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta_themes_update", {
        env_id: "env-1",
        name: "twentytwentysix",
        update_version: "1.2",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_themes_bulk-update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_themes_bulk-update", {
        env_id: "../bad",
        theme_ids: ["t1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_themes_bulk-update", {
        env_id: "env-1",
        theme_ids: ["t1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta_themes_bulk-update", {
        env_id: "env-1",
        themes: [{ name: "twentytwentysix" }, { name: "storefront" }],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/themes/bulk-update",
          method: "PUT",
          body: {
            themes: [{ name: "twentytwentysix" }, { name: "storefront" }],
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_themes_bulk-update", {
        env_id: "env-1",
        theme_ids: ["t1"],
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_themes_list-wp", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_themes_list-wp", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_themes_list-wp", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { themes: [] });
      const result = await ctx.callTool("kinsta_themes_list-wp", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/wp-themes",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_themes_list-wp", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
