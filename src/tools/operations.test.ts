import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerOperationTools } from "./operations.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Operation Tools", () => {
  const ctx = createToolTestContext();
  const getKinstaClientMock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerOperationTools(ctx.server);
  });

  it("should register both tools", () => {
    expect(ctx.tools.has("kinsta.operations.status")).toBe(true);
    expect(ctx.tools.has("kinsta.auth.validate")).toBe(true);
  });

  describe("kinsta.operations.status", () => {
    it("should return validation error for invalid operation_id", async () => {
      const result = await ctx.callTool("kinsta.operations.status", {
        operation_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Invalid operation_id");
    });

    it("should return auth error", async () => {
      mockClientAuthFailure(getKinstaClientMock);
      const result = await ctx.callTool("kinsta.operations.status", {
        operation_id: "op-123",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Authentication Error");
    });

    it("should return API error", async () => {
      mockClientSuccess(getKinstaClientMock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");

      const result = await ctx.callTool("kinsta.operations.status", {
        operation_id: "op-123",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(getKinstaClientMock, ctx);
      mockRequestSuccess(ctx, { status: "complete" });

      const result = await ctx.callTool("kinsta.operations.status", {
        operation_id: "op-123",
      });
      expect(result).not.toHaveProperty("isError");

      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/operations/op-123",
          method: "GET",
        })
      );
    });
  });

  describe("kinsta.auth.validate", () => {
    it("should return auth error", async () => {
      mockClientAuthFailure(getKinstaClientMock);
      const result = await ctx.callTool("kinsta.auth.validate", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return API error", async () => {
      mockClientSuccess(getKinstaClientMock, ctx);
      mockRequestError(ctx, "UNAUTHORIZED", "bad key");

      const result = await ctx.callTool("kinsta.auth.validate", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(getKinstaClientMock, ctx);
      mockRequestSuccess(ctx, { valid: true });

      const result = await ctx.callTool("kinsta.auth.validate", {});
      expect(result).not.toHaveProperty("isError");

      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/validate",
          method: "GET",
        })
      );
    });
  });
});
