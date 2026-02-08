import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerCompanyTools } from "./company.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Company Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerCompanyTools(ctx.server);
  });

  it("should register all 6 tools", () => {
    expect(ctx.tools.has("kinsta.company.users")).toBe(true);
    expect(ctx.tools.has("kinsta.company.regions")).toBe(true);
    expect(ctx.tools.has("kinsta.company.api-keys")).toBe(true);
    expect(ctx.tools.has("kinsta.company.activity-logs")).toBe(true);
    expect(ctx.tools.has("kinsta.company.plugins")).toBe(true);
    expect(ctx.tools.has("kinsta.company.themes")).toBe(true);
  });

  describe("kinsta.company.users", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.company.users", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.company.users", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { users: [] });
      const result = await ctx.callTool("kinsta.company.users", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/company-123/users",
          method: "GET",
        })
      );
    });
  });

  describe("kinsta.company.regions", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.company.regions", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { regions: [] });
      const result = await ctx.callTool("kinsta.company.regions", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/company-123/available-regions",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.company.regions", {});
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.company.api-keys", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.company.api-keys", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { keys: [] });
      const result = await ctx.callTool("kinsta.company.api-keys", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/company-123/api-keys",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.company.api-keys", {});
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.company.activity-logs", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.company.activity-logs", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { logs: [] });
      const result = await ctx.callTool("kinsta.company.activity-logs", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/company-123/activity-logs",
          method: "GET",
        })
      );
    });

    it("should pass all optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { logs: [] });
      await ctx.callTool("kinsta.company.activity-logs", {
        limit: 10,
        offset: 5,
        category: "siteActions",
        site_id: "s1",
        id_initiated_by: "u1",
        id_api_key: "k1",
        language: "en",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            limit: "10",
            offset: "5",
            category: "siteActions",
            site_id: "s1",
            id_initiated_by: "u1",
            id_api_key: "k1",
            language: "en",
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.company.activity-logs", {});
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.company.plugins", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.company.plugins", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { plugins: [] });
      const result = await ctx.callTool("kinsta.company.plugins", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/company-123/wp-plugins",
        })
      );
    });

    it("should include order_by as JSON string when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { plugins: [] });
      await ctx.callTool("kinsta.company.plugins", {
        order_by: { field: "name", order: "asc" },
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            order_by: JSON.stringify({ field: "name", order: "asc" }),
          }),
        })
      );
    });

    it("should pass optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { plugins: [] });
      await ctx.callTool("kinsta.company.plugins", {
        offset: 0,
        limit: 10,
        search: "woo",
        status: "active",
        column: "name",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            offset: "0",
            limit: "10",
            search: "woo",
            status: "active",
            column: "name",
          }),
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.company.plugins", {});
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.company.themes", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.company.themes", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { themes: [] });
      const result = await ctx.callTool("kinsta.company.themes", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/company-123/wp-themes",
        })
      );
    });

    it("should include order_by as JSON string when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { themes: [] });
      await ctx.callTool("kinsta.company.themes", {
        order_by: { field: "name", order: "desc" },
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            order_by: JSON.stringify({ field: "name", order: "desc" }),
          }),
        })
      );
    });

    it("should pass optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { themes: [] });
      await ctx.callTool("kinsta.company.themes", {
        offset: 0,
        limit: 10,
        search: "theme",
        status: "active",
        column: "name",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            offset: "0",
            limit: "10",
            search: "theme",
            status: "active",
            column: "name",
          }),
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.company.themes", {});
      expect(result).toHaveProperty("isError", true);
    });
  });
});
