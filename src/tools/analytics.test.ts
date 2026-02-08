import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClient: vi.fn(),
}));

import { getKinstaClient } from "../kinsta/client-factory.js";
import { registerAnalyticsTools } from "./analytics.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Analytics Tools", () => {
  const ctx = createToolTestContext();
  const mock = getKinstaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerAnalyticsTools(ctx.server);
  });

  const allTools = [
    "kinsta.analytics.visits",
    "kinsta.analytics.visits-usage",
    "kinsta.analytics.bandwidth",
    "kinsta.analytics.bandwidth-usage",
    "kinsta.analytics.cdn-bandwidth",
    "kinsta.analytics.cdn-bandwidth-usage",
    "kinsta.analytics.disk-space",
  ];

  it("should register all 7 analytics tools", () => {
    for (const name of allTools) {
      expect(ctx.tools.has(name)).toBe(true);
    }
  });

  // Test one tool fully
  describe("kinsta.analytics.visits", () => {
    it("should validate env_id", async () => {
      const result = await ctx.callTool("kinsta.analytics.visits", {
        env_id: "../bad",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("kinsta.analytics.visits", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("kinsta.analytics.visits", {
        env_id: "env-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without timeframe", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { visits: 100 });
      const result = await ctx.callTool("kinsta.analytics.visits", {
        env_id: "env-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/sites/environments/env-1/analytics/visits",
          method: "GET",
        })
      );
    });

    it("should pass timeframe params when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { visits: 100 });
      await ctx.callTool("kinsta.analytics.visits", {
        env_id: "env-1",
        timeframe_start: "2024-01-01",
        timeframe_end: "2024-01-31",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            timeframe_start: "2024-01-01",
            timeframe_end: "2024-01-31",
          },
        })
      );
    });
  });

  // Verify each remaining tool calls the correct path suffix
  it.each([
    ["kinsta.analytics.visits-usage", "visits-usage"],
    ["kinsta.analytics.bandwidth", "bandwidth"],
    ["kinsta.analytics.bandwidth-usage", "bandwidth-usage"],
    ["kinsta.analytics.cdn-bandwidth", "cdn-bandwidth"],
    ["kinsta.analytics.cdn-bandwidth-usage", "cdn-bandwidth-usage"],
    ["kinsta.analytics.disk-space", "disk-space"],
  ])("%s should call correct path suffix", async (toolName, suffix) => {
    mockClientSuccess(mock, ctx);
    mockRequestSuccess(ctx, { data: [] });
    await ctx.callTool(toolName, { env_id: "env-1" });
    expect(ctx.mockClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/sites/environments/env-1/analytics/${suffix}`,
      })
    );
  });
});
