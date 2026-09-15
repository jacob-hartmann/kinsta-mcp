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

  it("should register all 7 tools", () => {
    expect(ctx.tools.has("kinsta_backups_list")).toBe(true);
    expect(ctx.tools.has("kinsta_backups_downloadable")).toBe(true);
    expect(ctx.tools.has("kinsta_backups_create")).toBe(true);
    expect(ctx.tools.has("kinsta_backups_restore")).toBe(true);
    expect(ctx.tools.has("kinsta_backups_delete")).toBe(true);
    expect(ctx.tools.has("kinsta_backups_create-downloadable")).toBe(true);
    expect(ctx.tools.has("kinsta_backups_next-downloadable")).toBe(true);
  });

  describe("kinsta_backups_list", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_backups_list", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_backups_list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_backups_list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { backups: [] });
      const result = await ctx.callTool("kinsta_backups_list", {
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

  describe("kinsta_backups_downloadable", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_backups_downloadable", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_backups_downloadable", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { backups: [] });
      const result = await ctx.callTool("kinsta_backups_downloadable", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/downloadable-backups",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta_backups_downloadable", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_backups_create", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_backups_create", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_backups_create", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without tag (undefined body)", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta_backups_create", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/manual-backups",
          method: "POST",
          body: undefined,
        })
      );
    });

    it("should include tag when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      await ctx.callTool("kinsta_backups_create", {
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
      const result = await ctx.callTool("kinsta_backups_create", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_backups_restore", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta_backups_restore", {
        target_env_id: "../bad",
        backup_id: 1,
        notified_user_id: "user-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_backups_restore", {
        target_env_id: "env-1",
        backup_id: 1,
        notified_user_id: "user-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta_backups_restore", {
        target_env_id: "env-1",
        backup_id: 1,
        notified_user_id: "user-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/backups/restore",
          method: "POST",
          body: { backup_id: 1, notified_user_id: "user-1" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta_backups_restore", {
        target_env_id: "env-1",
        backup_id: 1,
        notified_user_id: "user-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta_backups_delete", () => {
    it("should validate backup_id", async () => {
      const result = await ctx.callTool("kinsta_backups_delete", {
        backup_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Invalid backup_id");
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta_backups_delete", {
        backup_id: "b1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta_backups_delete", {
        backup_id: "b1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/backups/b1",
          method: "DELETE",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta_backups_delete", {
        backup_id: "b1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  it.each([
    ["kinsta_backups_create-downloadable", "POST", "downloadable-backups"],
    [
      "kinsta_backups_next-downloadable",
      "GET",
      "next-downloadable-backup-available",
    ],
  ])("%s calls the current API endpoint", async (name, method, suffix) => {
    mockClientSuccess(mock, ctx);
    mockRequestSuccess(ctx, { operation_id: "op-1" });
    await ctx.callTool(name, { env_id: "env-1" });
    expect(ctx.mockClient.request).toHaveBeenCalledWith({
      path: `/sites/environments/env-1/${suffix}`,
      method,
    });
  });

  it.each([
    "kinsta_backups_create-downloadable",
    "kinsta_backups_next-downloadable",
  ])("%s validates IDs and handles auth/API errors", async (name) => {
    expect(await ctx.callTool(name, { env_id: "../bad" })).toHaveProperty(
      "isError",
      true
    );
    mockClientAuthFailure(mock);
    expect(await ctx.callTool(name, { env_id: "env-1" })).toHaveProperty(
      "isError",
      true
    );
    mockClientSuccess(mock, ctx);
    mockRequestError(ctx, "SERVER_ERROR", "fail");
    expect(await ctx.callTool(name, { env_id: "env-1" })).toHaveProperty(
      "isError",
      true
    );
  });
});
