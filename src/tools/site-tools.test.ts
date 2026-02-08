import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerSiteOperationTools } from "./site-tools.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Site Operation Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerSiteOperationTools(ctx.server);
  });

  it("should register all 5 tools", () => {
    expect(ctx.tools.has("kinsta.tools.clear-cache")).toBe(true);
    expect(ctx.tools.has("kinsta.tools.restart-php")).toBe(true);
    expect(ctx.tools.has("kinsta.tools.php-version")).toBe(true);
    expect(ctx.tools.has("kinsta.tools.denied-ips")).toBe(true);
    expect(ctx.tools.has("kinsta.tools.denied-ips.update")).toBe(true);
  });

  describe("kinsta.tools.clear-cache", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.tools.clear-cache", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.tools.clear-cache", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.tools.clear-cache", {
        environment_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/tools/clear-cache",
          method: "POST",
          body: { environment_id: "env-1" },
        })
      );
    });
  });

  describe("kinsta.tools.restart-php", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.tools.restart-php", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.tools.restart-php", {
        environment_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/php/restart",
          method: "POST",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.tools.restart-php", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.tools.php-version", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.tools.php-version", {
        environment_id: "env-1",
        php_version: "8.2",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without optional param", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.tools.php-version", {
        environment_id: "env-1",
        php_version: "8.2",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { php_version: "8.2" },
        })
      );
    });

    it("should include is_opt_out_from_automatic_php_update when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      await ctx.callTool("kinsta.tools.php-version", {
        environment_id: "env-1",
        php_version: "8.3",
        is_opt_out_from_automatic_php_update: true,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            php_version: "8.3",
            is_opt_out_from_automatic_php_update: true,
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.tools.php-version", {
        environment_id: "env-1",
        php_version: "8.2",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.tools.denied-ips", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.tools.denied-ips", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ips: [] });
      const result = await ctx.callTool("kinsta.tools.denied-ips", {
        environment_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/tools/denied-ips",
          method: "GET",
          params: { environment_id: "env-1" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.tools.denied-ips", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.tools.denied-ips.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.tools.denied-ips.update", {
        environment_id: "env-1",
        ip_list: ["1.2.3.4"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.tools.denied-ips.update", {
        environment_id: "env-1",
        ip_list: ["1.2.3.4"],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/tools/denied-ips",
          method: "PUT",
          body: { environment_id: "env-1", ip_list: ["1.2.3.4"] },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.tools.denied-ips.update", {
        environment_id: "env-1",
        ip_list: ["1.2.3.4"],
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
