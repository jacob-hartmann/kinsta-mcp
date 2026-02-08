import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerSiteTools } from "./sites.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Site Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerSiteTools(ctx.server);
  });

  it("should register all 7 tools", () => {
    expect(ctx.tools.has("kinsta.sites.list")).toBe(true);
    expect(ctx.tools.has("kinsta.sites.get")).toBe(true);
    expect(ctx.tools.has("kinsta.sites.create")).toBe(true);
    expect(ctx.tools.has("kinsta.sites.create-plain")).toBe(true);
    expect(ctx.tools.has("kinsta.sites.clone")).toBe(true);
    expect(ctx.tools.has("kinsta.sites.delete")).toBe(true);
    expect(ctx.tools.has("kinsta.sites.reset")).toBe(true);
  });

  describe("kinsta.sites.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sites.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.sites.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { sites: [] });
      const result = await ctx.callTool("kinsta.sites.list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites",
          method: "GET",
          params: { company: "company-123" },
        })
      );
    });

    it("should pass include_environments when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { sites: [] });
      await ctx.callTool("kinsta.sites.list", { include_environments: true });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { company: "company-123", include_environments: "true" },
        })
      );
    });
  });

  describe("kinsta.sites.get", () => {
    it("should validate site_id", async () => {
      const result = await ctx.callTool("kinsta.sites.get", {
        site_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sites.get", { site_id: "s1" });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.sites.get", { site_id: "s1" });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { site: { id: "s1" } });
      const result = await ctx.callTool("kinsta.sites.get", { site_id: "s1" });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/s1",
          method: "GET",
        })
      );
    });
  });

  describe("kinsta.sites.create", () => {
    const requiredArgs = {
      display_name: "My Site",
      region: "us-east-1",
      admin_email: "a@b.com",
      admin_password: "pass",
      admin_user: "admin",
      site_title: "My Site",
      wp_language: "en_US",
    };

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sites.create", requiredArgs);
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields only", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.sites.create", requiredArgs);
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites",
          method: "POST",
          body: { company: "company-123", ...requiredArgs },
        })
      );
    });

    it("should include optional booleans when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      await ctx.callTool("kinsta.sites.create", {
        ...requiredArgs,
        is_multisite: true,
        is_subdomain_multisite: false,
        woocommerce: true,
        wordpressseo: true,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            is_multisite: true,
            is_subdomain_multisite: false,
            woocommerce: true,
            wordpressseo: true,
          }),
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "bad");
      const result = await ctx.callTool("kinsta.sites.create", requiredArgs);
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.sites.create-plain", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sites.create-plain", {
        display_name: "Plain",
        region: "us-east-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.sites.create-plain", {
        display_name: "Plain",
        region: "us-east-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/plain",
          method: "POST",
          body: {
            company: "company-123",
            display_name: "Plain",
            region: "us-east-1",
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.sites.create-plain", {
        display_name: "Plain",
        region: "us-east-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.sites.clone", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sites.clone", {
        display_name: "Clone",
        source_env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.sites.clone", {
        display_name: "Clone",
        source_env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/clone",
          method: "POST",
          body: {
            company: "company-123",
            display_name: "Clone",
            source_env_id: "env-1",
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.sites.clone", {
        display_name: "Clone",
        source_env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.sites.delete", () => {
    it("should validate site_id", async () => {
      const result = await ctx.callTool("kinsta.sites.delete", {
        site_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sites.delete", {
        site_id: "s1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.sites.delete", {
        site_id: "s1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/s1",
          method: "DELETE",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.sites.delete", {
        site_id: "s1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.sites.reset", () => {
    it("should validate site_id", async () => {
      const result = await ctx.callTool("kinsta.sites.reset", {
        site_id: "../bad",
        admin_password: "p",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sites.reset", {
        site_id: "s1",
        admin_password: "p",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.sites.reset", {
        site_id: "s1",
        admin_password: "newpass",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/s1/reset",
          method: "POST",
          body: { admin_password: "newpass" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.sites.reset", {
        site_id: "s1",
        admin_password: "p",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
