import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerDomainTools } from "./domains.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Domain Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerDomainTools(ctx.server);
  });

  it("should register all 5 tools", () => {
    expect(ctx.tools.has("kinsta.domains.list")).toBe(true);
    expect(ctx.tools.has("kinsta.domains.add")).toBe(true);
    expect(ctx.tools.has("kinsta.domains.delete")).toBe(true);
    expect(ctx.tools.has("kinsta.domains.verification")).toBe(true);
    expect(ctx.tools.has("kinsta.domains.set-primary")).toBe(true);
  });

  describe("kinsta.domains.list", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.domains.list", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.domains.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.domains.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { domains: [] });
      const result = await ctx.callTool("kinsta.domains.list", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/domains",
          method: "GET",
        })
      );
    });
  });

  describe("kinsta.domains.add", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.domains.add", {
        env_id: "../bad",
        domain_name: "x.com",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.domains.add", {
        env_id: "env-1",
        domain_name: "x.com",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "dom-1" });
      const result = await ctx.callTool("kinsta.domains.add", {
        env_id: "env-1",
        domain_name: "example.com",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/domains",
          method: "POST",
          body: { domain_name: "example.com" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "bad");
      const result = await ctx.callTool("kinsta.domains.add", {
        env_id: "env-1",
        domain_name: "x.com",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.domains.delete", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.domains.delete", {
        env_id: "../bad",
        domain_ids: ["d1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.domains.delete", {
        env_id: "env-1",
        domain_ids: ["d1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.domains.delete", {
        env_id: "env-1",
        domain_ids: ["d1", "d2"],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/domains",
          method: "DELETE",
          body: { domain_ids: ["d1", "d2"] },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.domains.delete", {
        env_id: "env-1",
        domain_ids: ["d1"],
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.domains.verification", () => {
    it("should validate domain_id", async () => {
      const result = await ctx.callTool("kinsta.domains.verification", {
        domain_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.domains.verification", {
        domain_id: "dom-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { records: [] });
      const result = await ctx.callTool("kinsta.domains.verification", {
        domain_id: "dom-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/domains/dom-1/verification-records",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.domains.verification", {
        domain_id: "dom-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.domains.set-primary", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.domains.set-primary", {
        env_id: "../bad",
        domain_id: "dom-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.domains.set-primary", {
        env_id: "env-1",
        domain_id: "dom-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.domains.set-primary", {
        env_id: "env-1",
        domain_id: "dom-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/primary-domain",
          method: "PUT",
          body: { domain_id: "dom-1" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.domains.set-primary", {
        env_id: "env-1",
        domain_id: "dom-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
