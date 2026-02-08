import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerSftpUserTools } from "./sftp-users.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("SFTP User Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerSftpUserTools(ctx.server);
  });

  it("should register all 4 tools", () => {
    expect(ctx.tools.has("kinsta.sftp-users.list")).toBe(true);
    expect(ctx.tools.has("kinsta.sftp-users.toggle")).toBe(true);
    expect(ctx.tools.has("kinsta.sftp-users.add")).toBe(true);
    expect(ctx.tools.has("kinsta.sftp-users.remove")).toBe(true);
  });

  describe("kinsta.sftp-users.list", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.sftp-users.list", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sftp-users.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.sftp-users.list", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { accounts: [] });
      const result = await ctx.callTool("kinsta.sftp-users.list", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/additional-sftp-accounts",
          method: "GET",
        })
      );
    });
  });

  describe("kinsta.sftp-users.toggle", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.sftp-users.toggle", {
        env_id: "../bad",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sftp-users.toggle", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.sftp-users.toggle", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.sftp-users.toggle", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/additional-sftp-accounts/toggle",
          method: "PUT",
          body: { is_enabled: true },
        })
      );
    });
  });

  describe("kinsta.sftp-users.add", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.sftp-users.add", {
        env_id: "../bad",
        username: "u",
        password: "p",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sftp-users.add", {
        env_id: "env-1",
        username: "u",
        password: "p",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "acc-1" });
      const result = await ctx.callTool("kinsta.sftp-users.add", {
        env_id: "env-1",
        username: "user1",
        password: "pass1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/additional-sftp-accounts",
          method: "POST",
          body: { username: "user1", password: "pass1" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "bad");
      const result = await ctx.callTool("kinsta.sftp-users.add", {
        env_id: "env-1",
        username: "u",
        password: "p",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.sftp-users.remove", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.sftp-users.remove", {
        env_id: "../bad",
        account_id: "acc-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should validate account_id", async () => {
      const result = await ctx.callTool("kinsta.sftp-users.remove", {
        env_id: "env-1",
        account_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Invalid account_id");
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.sftp-users.remove", {
        env_id: "env-1",
        account_id: "acc-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.sftp-users.remove", {
        env_id: "env-1",
        account_id: "acc-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/additional-sftp-accounts/acc-1",
          method: "DELETE",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.sftp-users.remove", {
        env_id: "env-1",
        account_id: "acc-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
