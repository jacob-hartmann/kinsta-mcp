import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerEnvironmentTools } from "./environments.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Environment Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerEnvironmentTools(ctx.server);
  });

  it("should register all 22 tools", () => {
    const names = [
      "kinsta.environments.list",
      "kinsta.environments.create",
      "kinsta.environments.create-plain",
      "kinsta.environments.clone",
      "kinsta.environments.push",
      "kinsta.environments.delete",
      "kinsta.environments.php-allocation",
      "kinsta.environments.php-allocation-site",
      "kinsta.environments.webroot",
      "kinsta.environments.files",
      "kinsta.environments.redirects",
      "kinsta.environments.redirects.update",
      "kinsta.environments.ssh.status",
      "kinsta.environments.ssh.toggle",
      "kinsta.environments.ssh.password-access",
      "kinsta.environments.ssh.generate-password",
      "kinsta.environments.ssh.password",
      "kinsta.environments.ssh.ip-allowlist",
      "kinsta.environments.ssh.ip-allowlist.update",
      "kinsta.environments.ssh.config",
      "kinsta.environments.ssh.password-expiration",
      "kinsta.environments.wp-cli",
      "kinsta.environments.phpmyadmin",
    ];
    for (const name of names) {
      expect(ctx.tools.has(name)).toBe(true);
    }
  });

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  describe("kinsta.environments.list", () => {
    it("should validate site_id", async () => {
      const result = await ctx.callTool("kinsta.environments.list", {
        site_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.list", {
        site_id: "s1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.environments.list", {
        site_id: "s1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { environments: [] });
      const result = await ctx.callTool("kinsta.environments.list", {
        site_id: "s1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/s1/environments",
          method: "GET",
        })
      );
    });
  });

  describe("kinsta.environments.create", () => {
    const required = {
      site_id: "s1",
      display_name: "Staging",
      site_title: "My Site",
      is_premium: true,
      admin_email: "a@b.com",
      admin_password: "pass",
      admin_user: "admin",
      wp_language: "en_US",
    };

    it("should validate site_id", async () => {
      const result = await ctx.callTool("kinsta.environments.create", {
        ...required,
        site_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.create", required);
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields only", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.environments.create", required);
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/s1/environments",
          method: "POST",
        })
      );
    });

    it("should include optional booleans", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      await ctx.callTool("kinsta.environments.create", {
        ...required,
        is_multisite: true,
        is_subdomain_multisite: false,
        woocommerce: true,
        wordpress_plugin_edd: true,
        wordpressseo: true,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            is_multisite: true,
            is_subdomain_multisite: false,
            woocommerce: true,
            wordpress_plugin_edd: true,
            wordpressseo: true,
          }),
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "bad");
      const result = await ctx.callTool("kinsta.environments.create", required);
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.create-plain", () => {
    it("should validate site_id", async () => {
      const result = await ctx.callTool("kinsta.environments.create-plain", {
        site_id: "../bad",
        display_name: "Plain",
        is_premium: false,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.create-plain", {
        site_id: "s1",
        display_name: "Plain",
        is_premium: false,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.environments.create-plain", {
        site_id: "s1",
        display_name: "Plain",
        is_premium: false,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/s1/environments/plain",
          method: "POST",
          body: { display_name: "Plain", is_premium: false },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.create-plain", {
        site_id: "s1",
        display_name: "Plain",
        is_premium: false,
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.clone", () => {
    it("should validate site_id", async () => {
      const result = await ctx.callTool("kinsta.environments.clone", {
        site_id: "../bad",
        display_name: "Clone",
        is_premium: false,
        source_env_id: "e1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.clone", {
        site_id: "s1",
        display_name: "Clone",
        is_premium: false,
        source_env_id: "e1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.environments.clone", {
        site_id: "s1",
        display_name: "Clone",
        is_premium: true,
        source_env_id: "e1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/s1/environments/clone",
          method: "POST",
          body: {
            display_name: "Clone",
            is_premium: true,
            source_env_id: "e1",
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.clone", {
        site_id: "s1",
        display_name: "Clone",
        is_premium: false,
        source_env_id: "e1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.push", () => {
    const required = {
      site_id: "s1",
      source_env_id: "e1",
      target_env_id: "e2",
    };

    it("should validate site_id", async () => {
      const result = await ctx.callTool("kinsta.environments.push", {
        ...required,
        site_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.push", required);
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required only", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      const result = await ctx.callTool("kinsta.environments.push", required);
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/s1/environments",
          method: "PUT",
          body: { source_env_id: "e1", target_env_id: "e2" },
        })
      );
    });

    it("should include all optional fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { operation_id: "op-1" });
      await ctx.callTool("kinsta.environments.push", {
        ...required,
        push_db: true,
        push_files: true,
        run_search_and_replace: true,
        push_files_option: "ALL_FILES",
        file_list: ["file1.php"],
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            push_db: true,
            push_files: true,
            run_search_and_replace: true,
            push_files_option: "ALL_FILES",
            file_list: ["file1.php"],
          }),
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.push", required);
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.delete", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.delete", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.delete", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.environments.delete", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1",
          method: "DELETE",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("kinsta.environments.delete", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  // ---------------------------------------------------------------------------
  // PHP & Configuration
  // ---------------------------------------------------------------------------

  describe("kinsta.environments.php-allocation", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.php-allocation", {
        env_id: "../bad",
        thread_count: 4,
        thread_memory: 128,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.php-allocation", {
        env_id: "env-1",
        thread_count: 4,
        thread_memory: 128,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.environments.php-allocation", {
        env_id: "env-1",
        thread_count: 4,
        thread_memory: 128,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/php-allocation",
          method: "POST",
          body: { thread_count: 4, thread_memory: 128 },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.php-allocation", {
        env_id: "env-1",
        thread_count: 4,
        thread_memory: 128,
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.php-allocation-site", () => {
    it("should validate site_id", async () => {
      const result = await ctx.callTool(
        "kinsta.environments.php-allocation-site",
        { site_id: "../bad", thread_count: 4, thread_memory: 128 }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "kinsta.environments.php-allocation-site",
        { site_id: "s1", thread_count: 4, thread_memory: 128 }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool(
        "kinsta.environments.php-allocation-site",
        { site_id: "s1", thread_count: 4, thread_memory: 128 }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/s1/php-allocation",
          method: "POST",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "kinsta.environments.php-allocation-site",
        { site_id: "s1", thread_count: 4, thread_memory: 128 }
      );
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.webroot", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.webroot", {
        env_id: "../bad",
        web_root_subfolder: "public",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.webroot", {
        env_id: "env-1",
        web_root_subfolder: "public",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.environments.webroot", {
        env_id: "env-1",
        web_root_subfolder: "public",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/webroot",
          body: { web_root_subfolder: "public" },
        })
      );
    });

    it("should include optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      await ctx.callTool("kinsta.environments.webroot", {
        env_id: "env-1",
        web_root_subfolder: "public",
        clear_all_cache: true,
        refresh_plugins_and_themes: true,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            web_root_subfolder: "public",
            clear_all_cache: true,
            refresh_plugins_and_themes: true,
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.webroot", {
        env_id: "env-1",
        web_root_subfolder: "public",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  // ---------------------------------------------------------------------------
  // Files & Redirects
  // ---------------------------------------------------------------------------

  describe("kinsta.environments.files", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.files", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.files", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { files: [] });
      const result = await ctx.callTool("kinsta.environments.files", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/files",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.files", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.redirects", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.redirects", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.redirects", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without optional params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { redirects: [] });
      const result = await ctx.callTool("kinsta.environments.redirects", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/redirect-rules",
          method: "GET",
        })
      );
    });

    it("should pass optional query params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { redirects: [] });
      await ctx.callTool("kinsta.environments.redirects", {
        env_id: "env-1",
        limit: 10,
        offset: 5,
        key: "from",
        order: "ascend",
        search_query: "foo",
        regex_search: "true",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            limit: "10",
            offset: "5",
            key: "from",
            order: "ascend",
            search_query: "foo",
            regex_search: "true",
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.redirects", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.redirects.update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool(
        "kinsta.environments.redirects.update",
        { env_id: "../bad", action_type: "NEW" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "kinsta.environments.redirects.update",
        { env_id: "env-1", action_type: "NEW" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required only", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool(
        "kinsta.environments.redirects.update",
        { env_id: "env-1", action_type: "DELETE_ALL" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/redirect-rules",
          method: "POST",
          body: { action_type: "DELETE_ALL" },
        })
      );
    });

    it("should include all optional body fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      await ctx.callTool("kinsta.environments.redirects.update", {
        env_id: "env-1",
        action_type: "NEW",
        rules_to_update: [{ id: "r1" }],
        new_value: { from: "/a", to: "/b" },
        limit: 10,
        offset: 0,
        key: "from",
        order: "ascend",
        search_query: "test",
        regex_search: "false",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            action_type: "NEW",
            rules_to_update: [{ id: "r1" }],
            new_value: { from: "/a", to: "/b" },
            limit: 10,
            offset: 0,
            key: "from",
            order: "ascend",
            search_query: "test",
            regex_search: "false",
          },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "kinsta.environments.redirects.update",
        { env_id: "env-1", action_type: "NEW" }
      );
      expect(result).toHaveProperty("isError", true);
    });
  });

  // ---------------------------------------------------------------------------
  // SSH
  // ---------------------------------------------------------------------------

  describe("kinsta.environments.ssh.status", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.ssh.status", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.ssh.status", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { enabled: true });
      const result = await ctx.callTool("kinsta.environments.ssh.status", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/sftp-ssh/status",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.ssh.status", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.ssh.toggle", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.ssh.toggle", {
        env_id: "../bad",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.ssh.toggle", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool("kinsta.environments.ssh.toggle", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/sftp-ssh",
          body: { is_enabled: true },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.ssh.toggle", {
        env_id: "env-1",
        is_enabled: true,
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.ssh.password-access", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool(
        "kinsta.environments.ssh.password-access",
        { env_id: "../bad", is_enabled: true }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "kinsta.environments.ssh.password-access",
        { env_id: "env-1", is_enabled: true }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool(
        "kinsta.environments.ssh.password-access",
        { env_id: "env-1", is_enabled: true }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/ssh/set-password-status",
          body: { is_enabled: true },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "kinsta.environments.ssh.password-access",
        { env_id: "env-1", is_enabled: true }
      );
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.ssh.generate-password", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool(
        "kinsta.environments.ssh.generate-password",
        { env_id: "../bad" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "kinsta.environments.ssh.generate-password",
        { env_id: "env-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { password: "abc" });
      const result = await ctx.callTool(
        "kinsta.environments.ssh.generate-password",
        { env_id: "env-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/sftp-password",
          method: "POST",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "kinsta.environments.ssh.generate-password",
        { env_id: "env-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.ssh.password", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.ssh.password", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.ssh.password", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { password: "abc" });
      const result = await ctx.callTool("kinsta.environments.ssh.password", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/sftp-password",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.ssh.password", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.ssh.ip-allowlist", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool(
        "kinsta.environments.ssh.ip-allowlist",
        { env_id: "../bad" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "kinsta.environments.ssh.ip-allowlist",
        { env_id: "env-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ips: [] });
      const result = await ctx.callTool(
        "kinsta.environments.ssh.ip-allowlist",
        { env_id: "env-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/sftp-allowlist",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "kinsta.environments.ssh.ip-allowlist",
        { env_id: "env-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.ssh.ip-allowlist.update", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool(
        "kinsta.environments.ssh.ip-allowlist.update",
        { env_id: "../bad", ip_allowlist: ["1.2.3.4"] }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "kinsta.environments.ssh.ip-allowlist.update",
        { env_id: "env-1", ip_allowlist: ["1.2.3.4"] }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool(
        "kinsta.environments.ssh.ip-allowlist.update",
        { env_id: "env-1", ip_allowlist: ["1.2.3.4"] }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/sftp-allowlist",
          method: "POST",
          body: { ip_allowlist: ["1.2.3.4"] },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "kinsta.environments.ssh.ip-allowlist.update",
        { env_id: "env-1", ip_allowlist: [] }
      );
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.ssh.config", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.ssh.config", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.ssh.config", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { host: "ssh.example.com" });
      const result = await ctx.callTool("kinsta.environments.ssh.config", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/sftp-config",
          method: "GET",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.ssh.config", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.ssh.password-expiration", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool(
        "kinsta.environments.ssh.password-expiration",
        { env_id: "../bad", exp_interval: "days_7" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "kinsta.environments.ssh.password-expiration",
        { env_id: "env-1", exp_interval: "days_7" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { ok: true });
      const result = await ctx.callTool(
        "kinsta.environments.ssh.password-expiration",
        { env_id: "env-1", exp_interval: "days_30" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/sftp-expiration",
          method: "POST",
          body: { exp_interval: "days_30" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "kinsta.environments.ssh.password-expiration",
        { env_id: "env-1", exp_interval: "days_7" }
      );
      expect(result).toHaveProperty("isError", true);
    });
  });

  // ---------------------------------------------------------------------------
  // WP-CLI & phpMyAdmin
  // ---------------------------------------------------------------------------

  describe("kinsta.environments.wp-cli", () => {
    it("should reject command without 'wp ' prefix", async () => {
      const result = await ctx.callTool("kinsta.environments.wp-cli", {
        env_id: "env-1",
        wp_command: "ls -la",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain(
        'must start with "wp "'
      );
    });

    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.wp-cli", {
        env_id: "../bad",
        wp_command: "wp plugin list",
      });
      expect(result).toHaveProperty("isError", true);
      expect((result as any).content[0].text).toContain("Invalid env_id");
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.wp-cli", {
        env_id: "env-1",
        wp_command: "wp plugin list",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { output: "Success" });
      const result = await ctx.callTool("kinsta.environments.wp-cli", {
        env_id: "env-1",
        wp_command: "wp plugin list",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/wp-cli",
          method: "POST",
          body: { wp_command: "wp plugin list" },
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.wp-cli", {
        env_id: "env-1",
        wp_command: "wp plugin list",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });

  describe("kinsta.environments.phpmyadmin", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.environments.phpmyadmin", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.environments.phpmyadmin", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { token: "abc" });
      const result = await ctx.callTool("kinsta.environments.phpmyadmin", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/environments/env-1/phpmyadmin-login",
          method: "POST",
        })
      );
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.environments.phpmyadmin", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });
  });
});
