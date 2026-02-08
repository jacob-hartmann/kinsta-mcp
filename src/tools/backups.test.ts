import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerBackupTools } from "./backups.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Backup Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerBackupTools(ctx.server);
  });

  it("should register all 5 tools", () => {
    expect(ctx.tools.has("kinsta.backups.list")).toBe(true);
    expect(ctx.tools.has("kinsta.backups.downloadable")).toBe(true);
    expect(ctx.tools.has("kinsta.backups.create")).toBe(true);
    expect(ctx.tools.has("kinsta.backups.restore")).toBe(true);
    expect(ctx.tools.has("kinsta.backups.delete")).toBe(true);
  });

  describe("kinsta.backups.list", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.backups.list", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.backups.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.backups.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { backups: [] });
      const result = await ctx.callTool("kinsta.backups.list", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/backups",
          method: "GET",
        })
      );
    });
  });

  describe("kinsta.backups.downloadable", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.backups.downloadable", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.backups.downloadable", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { backups: [] });
      const result = await ctx.callTool("kinsta.backups.downloadable", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/backups/downloadable",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.backups.downloadable", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.backups.create", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.backups.create", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.backups.create", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without tag (undefined body)", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.backups.create", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/backups/manual",
          method: "POST",
          body: undefined,
        })
      );
    });

    it("should include tag when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      await ctx.callTool("kinsta.backups.create", {
        env_id: "env-1",
        tag: "before-deploy",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { tag: "before-deploy" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.backups.create", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.backups.restore", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.backups.restore", {
        env_id: "../bad",
        backup_id: "b1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.backups.restore", {
        env_id: "env-1",
        backup_id: "b1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.backups.restore", {
        env_id: "env-1",
        backup_id: "b1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/backups/restore",
          method: "POST",
          body: { backup_id: "b1" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.backups.restore", {
        env_id: "env-1",
        backup_id: "b1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.backups.delete", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.backups.delete", {
        env_id: "../bad",
        backup_id: "b1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should validate backup_id", async () => {
      const result = await ctx.callTool("kinsta.backups.delete", {
        env_id: "env-1",
        backup_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Invalid backup_id");
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.backups.delete", {
        env_id: "env-1",
        backup_id: "b1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.backups.delete", {
        env_id: "env-1",
        backup_id: "b1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/backups/b1",
          method: "DELETE",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.backups.delete", {
        env_id: "env-1",
        backup_id: "b1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
