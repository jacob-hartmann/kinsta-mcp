import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerLogTools } from "./logs.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Log Tools", () => {
  const ctx = createToolTestContext();
  const getKinstaClientMock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerLogTools(ctx.server);
  });

  it("should register kinsta.logs.get", () => {
    expect(ctx.tools.has("kinsta.logs.get")).toBe(true);
  });

  describe("kinsta.logs.get", () => {
    it("should return validation error for invalid env_id", async () => {
      const result = await ctx.callTool("kinsta.logs.get", {
        env_id: "../invalid",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Invalid env_id");
    });

    it("should return auth error when client fails", async () => {
      mockClientAuthFailure(getKinstaClientMock);
      const result = await ctx.callTool("kinsta.logs.get", {
        env_id: "env-123",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Authentication Error");
    });

    it("should return API error", async () => {
      mockClientSuccess(getKinstaClientMock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");

      const result = await ctx.callTool("kinsta.logs.get", {
        env_id: "env-123",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("SERVER_ERROR");
    });

    it("should return success without optional params", async () => {
      mockClientSuccess(getKinstaClientMock, ctx);
      mockRequestSuccess(ctx, { logs: "data" });

      const result = await ctx.callTool("kinsta.logs.get", {
        env_id: "env-123",
      });
      expect(result).not.toHaveProperty("isError");
      expect((result as any).content[0].text).toContain("logs");
    });

    it("should pass optional file_name and lines params", async () => {
      mockClientSuccess(getKinstaClientMock, ctx);
      mockRequestSuccess(ctx, { logs: "data" });

      await ctx.callTool("kinsta.logs.get", {
        env_id: "env-123",
        file_name: "error.log",
        lines: 100,
      });

      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-123/logs",
          method: "GET",
          params: { file_name: "error.log", lines: "100" },
        })
      );
    });
  });
});
