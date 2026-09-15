import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerEdgeCdnTools } from "./edge-cdn.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Edge CDN Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerEdgeCdnTools(ctx.server);
  });

  it("should register all 4 tools", () => {
    expect(ctx.tools.has("kinsta_edge-cache_clear")).toBe(true);
    expect(ctx.tools.has("kinsta_edge-cache_toggle")).toBe(true);
    expect(ctx.tools.has("kinsta_cdn_clear-cache")).toBe(true);
    expect(ctx.tools.has("kinsta_cdn_image-optimization")).toBe(true);
  });

  describe("kinsta_edge-cache_clear", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_edge-cache_clear", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_edge-cache_clear", {
        env_id: "env-1",
      });
      expect((result as any).content[0].text).toContain("Authentication Error");
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_edge-cache_clear", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta_edge-cache_clear", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/edge-caching/clear",
          method: "POST",
          body: { environment_id: "env-1" },
        })
      );
    });

    it("should include optional cache settings", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      await ctx.callTool("kinsta_edge-cache_clear", {
        env_id: "env-1",
        clear_subdirectories: true,
        url: "/products",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            environment_id: "env-1",
            clear_subdirectories: true,
            url: "/products",
          },
        })
      );
    });
  });

  describe("kinsta_edge-cache_toggle", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_edge-cache_toggle", {
        env_id: "../bad",
        enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_edge-cache_toggle", {
        env_id: "env-1",
        enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_edge-cache_toggle", {
        env_id: "env-1",
        enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta_edge-cache_toggle", {
        env_id: "env-1",
        enabled: true,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/edge-caching/status",
          method: "PUT",
          body: { environment_id: "env-1", enabled: true },
        })
      );
    });
  });

  describe("kinsta_cdn_clear-cache", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_cdn_clear-cache", {
        env_id: "../bad",
        cdn_cache_id: "cdn-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_cdn_clear-cache", {
        env_id: "env-1",
        cdn_cache_id: "cdn-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_cdn_clear-cache", {
        env_id: "env-1",
        cdn_cache_id: "cdn-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta_cdn_clear-cache", {
        env_id: "env-1",
        cdn_cache_id: "cdn-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/cdn/clear-cache",
          method: "POST",
          body: { environment_id: "env-1", cdn_cache_id: "cdn-1" },
        })
      );
    });
  });

  describe("kinsta_cdn_image-optimization", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_cdn_image-optimization", {
        env_id: "../bad",
        image_optimization_type: "lossy",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_cdn_image-optimization", {
        env_id: "env-1",
        image_optimization_type: "lossy",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success for lossy optimization", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta_cdn_image-optimization", {
        env_id: "env-1",
        image_optimization_type: "lossy",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/cdn/image-optimization",
          method: "PUT",
          body: {
            environment_id: "env-1",
            image_optimization_type: "lossy",
          },
        })
      );
    });

    it("should support lossless optimization", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      await ctx.callTool("kinsta_cdn_image-optimization", {
        env_id: "env-1",
        image_optimization_type: "lossless",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            environment_id: "env-1",
            image_optimization_type: "lossless",
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_cdn_image-optimization", {
        env_id: "env-1",
        image_optimization_type: false,
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
