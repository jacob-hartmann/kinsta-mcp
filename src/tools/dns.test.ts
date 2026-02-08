import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerDnsTools } from "./dns.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("DNS Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerDnsTools(ctx.server);
  });

  it("should register all 5 tools", () => {
    expect(ctx.tools.has("kinsta.dns.domains")).toBe(true);
    expect(ctx.tools.has("kinsta.dns.records")).toBe(true);
    expect(ctx.tools.has("kinsta.dns.records.create")).toBe(true);
    expect(ctx.tools.has("kinsta.dns.records.update")).toBe(true);
    expect(ctx.tools.has("kinsta.dns.records.delete")).toBe(true);
  });

  describe("kinsta.dns.domains", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.dns.domains", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.dns.domains", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { domains: [] });
      const result = await ctx.callTool("kinsta.dns.domains", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/domains",
          method: "GET",
          params: { company: "company-123" },
        })
      );
    });
  });

  describe("kinsta.dns.records", () => {
    it("should validate domain_id", async () => {
      const result = await ctx.callTool("kinsta.dns.records", {
        domain_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.dns.records", {
        domain_id: "dom-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { records: [] });
      const result = await ctx.callTool("kinsta.dns.records", {
        domain_id: "dom-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/domains/dom-1/dns-records",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.dns.records", {
        domain_id: "dom-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.dns.records.create", () => {
    const validArgs = {
      domain_id: "dom-1",
      type: "A",
      name: "@",
      ttl: 300,
      resource_records: [{ value: "1.2.3.4" }],
    };

    it("should validate domain_id", async () => {
      const result = await ctx.callTool("kinsta.dns.records.create", {
        ...validArgs,
        domain_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.dns.records.create", validArgs);
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "rec-1" });
      const result = await ctx.callTool("kinsta.dns.records.create", validArgs);
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/domains/dom-1/dns-records",
          method: "POST",
          body: {
            type: "A",
            name: "@",
            ttl: 300,
            resource_records: [{ value: "1.2.3.4" }],
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "bad");
      const result = await ctx.callTool("kinsta.dns.records.create", validArgs);
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.dns.records.update", () => {
    it("should validate domain_id", async () => {
      const result = await ctx.callTool("kinsta.dns.records.update", {
        domain_id: "../bad",
        type: "A",
        name: "@",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.dns.records.update", {
        domain_id: "dom-1",
        type: "A",
        name: "@",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields only", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.dns.records.update", {
        domain_id: "dom-1",
        type: "A",
        name: "@",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { type: "A", name: "@" },
        })
      );
    });

    it("should include optional fields when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      await ctx.callTool("kinsta.dns.records.update", {
        domain_id: "dom-1",
        type: "A",
        name: "@",
        ttl: 600,
        new_resource_records: [{ value: "5.6.7.8" }],
        removed_resource_records: [{ value: "1.2.3.4" }],
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            type: "A",
            name: "@",
            ttl: 600,
            new_resource_records: [{ value: "5.6.7.8" }],
            removed_resource_records: [{ value: "1.2.3.4" }],
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.dns.records.update", {
        domain_id: "dom-1",
        type: "A",
        name: "@",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.dns.records.delete", () => {
    it("should validate domain_id", async () => {
      const result = await ctx.callTool("kinsta.dns.records.delete", {
        domain_id: "../bad",
        type: "A",
        name: "@",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.dns.records.delete", {
        domain_id: "dom-1",
        type: "A",
        name: "@",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.dns.records.delete", {
        domain_id: "dom-1",
        type: "A",
        name: "@",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/domains/dom-1/dns-records",
          method: "DELETE",
          body: { type: "A", name: "@" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.dns.records.delete", {
        domain_id: "dom-1",
        type: "A",
        name: "@",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
