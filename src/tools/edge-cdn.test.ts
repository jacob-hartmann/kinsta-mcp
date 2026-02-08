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
    expect(ctx.tools.has("kinsta.edge-cache.clear")).toBe(true);
    expect(ctx.tools.has("kinsta.edge-cache.toggle")).toBe(true);
    expect(ctx.tools.has("kinsta.cdn.clear-cache")).toBe(true);
    expect(ctx.tools.has("kinsta.cdn.image-optimization")).toBe(true);
  });

  describe("kinsta.edge-cache.clear", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.edge-cache.clear", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.edge-cache.clear", {
        env_id: "env-1",
      });
      expect((result as any).content[0].text).toContain("Authentication Error");
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.edge-cache.clear", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.edge-cache.clear", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/edge-cache/clear",
          method: "POST",
        })
      );
    });
  });

  describe("kinsta.edge-cache.toggle", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.edge-cache.toggle", {
        env_id: "../bad",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.edge-cache.toggle", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.edge-cache.toggle", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.edge-cache.toggle", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/edge-cache/status",
          method: "PUT",
          body: { is_enabled: true },
        })
      );
    });
  });

  describe("kinsta.cdn.clear-cache", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.cdn.clear-cache", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.cdn.clear-cache", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.cdn.clear-cache", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.cdn.clear-cache", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/cdn-cache/clear",
          method: "POST",
        })
      );
    });
  });

  describe("kinsta.cdn.image-optimization", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.cdn.image-optimization", {
        env_id: "../bad",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.cdn.image-optimization", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without is_lossless", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.cdn.image-optimization", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { is_enabled: true },
        })
      );
    });

    it("should include is_lossless when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      await ctx.callTool("kinsta.cdn.image-optimization", {
        env_id: "env-1",
        is_enabled: true,
        is_lossless: true,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { is_enabled: true, is_lossless: true },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.cdn.image-optimization", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
