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

  it("should register all 8 tools", () => {
    expect(ctx.tools.has("kinsta_tools_clear-cache")).toBe(true);
    expect(ctx.tools.has("kinsta_tools_restart-php")).toBe(true);
    expect(ctx.tools.has("kinsta_tools_php-version")).toBe(true);
    expect(ctx.tools.has("kinsta_tools_denied-ips")).toBe(true);
    expect(ctx.tools.has("kinsta_tools_denied-ips_update")).toBe(true);
    expect(ctx.tools.has("kinsta_tools_force-https_get")).toBe(true);
    expect(ctx.tools.has("kinsta_tools_force-https_set")).toBe(true);
    expect(ctx.tools.has("kinsta_tools_search-and-replace")).toBe(true);
  });

  describe("kinsta_tools_clear-cache", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_tools_clear-cache", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_tools_clear-cache", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta_tools_clear-cache", {
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

  describe("kinsta_tools_restart-php", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_tools_restart-php", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta_tools_restart-php", {
        environment_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/tools/restart-php",
          method: "POST",
          body: { environment_id: "env-1" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta_tools_restart-php", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_tools_php-version", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_tools_php-version", {
        environment_id: "env-1",
        php_version: "8.2",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without optional param", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta_tools_php-version", {
        environment_id: "env-1",
        php_version: "8.2",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/tools/modify-php-version",
          method: "PUT",
          body: { environment_id: "env-1", php_version: "8.2" },
        })
      );
    });

    it("should include is_opt_out_from_automatic_php_update when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      await ctx.callTool("kinsta_tools_php-version", {
        environment_id: "env-1",
        php_version: "8.3",
        is_opt_out_from_automatic_php_update: true,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            environment_id: "env-1",
            php_version: "8.3",
            is_opt_out_from_automatic_php_update: true,
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_tools_php-version", {
        environment_id: "env-1",
        php_version: "8.2",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_tools_denied-ips", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_tools_denied-ips", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ips: [] });
      const result = await ctx.callTool("kinsta_tools_denied-ips", {
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
      const result = await ctx.callTool("kinsta_tools_denied-ips", {
        environment_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_tools_denied-ips_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_tools_denied-ips_update", {
        environment_id: "env-1",
        ip_list: ["1.2.3.4"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta_tools_denied-ips_update", {
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
      const result = await ctx.callTool("kinsta_tools_denied-ips_update", {
        environment_id: "env-1",
        ip_list: ["1.2.3.4"],
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  it.each([
    ["kinsta_tools_force-https_get", "GET"],
    ["kinsta_tools_force-https_set", "POST"],
  ])("%s calls the force HTTPS endpoint", async (name, method) => {
    mockClientSuccess(mock, ctx);
    mockRequestSuccess(ctx, { ok: true });
    await ctx.callTool(name, {
      env_id: "env-1",
      type: "ENABLED_REDIRECT_TO_PRIMARY",
    });
    expect(ctx.mockClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/sites/environments/env-1/force-https-status",
        method,
      })
    );
  });

  it.each([
    ["kinsta_tools_force-https_get", { env_id: "env-1" }],
    [
      "kinsta_tools_force-https_set",
      { env_id: "env-1", type: "ENABLED_REDIRECT_TO_PRIMARY" },
    ],
    [
      "kinsta_tools_search-and-replace",
      {
        environment_id: "env-1",
        search: "old",
        replace: "new",
        perform_replacement: false,
        is_clear_cache: false,
      },
    ],
  ])("%s handles auth and API errors", async (name, args) => {
    mockClientAuthFailure(mock);
    expect(await ctx.callTool(name, args)).toHaveProperty("isError", true);
    mockClientSuccess(mock, ctx);
    mockRequestError(ctx, "SERVER_ERROR", "fail");
    expect(await ctx.callTool(name, args)).toHaveProperty("isError", true);
  });

  it("calls search and replace in preview mode by default", async () => {
    mockClientSuccess(mock, ctx);
    mockRequestSuccess(ctx, { matches: 2 });
    await ctx.callTool("kinsta_tools_search-and-replace", {
      environment_id: "env-1",
      search: "old",
      replace: "new",
      perform_replacement: false,
      is_clear_cache: false,
    });
    expect(ctx.mockClient.request).toHaveBeenCalledWith({
      path: "/sites/tools/search-and-replace",
      method: "POST",
      body: {
        environment_id: "env-1",
        search: "old",
        replace: "new",
        perform_replacement: false,
        is_clear_cache: false,
      },
    });
  });
});
