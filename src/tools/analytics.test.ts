import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../kinsta/client-factory.js", () => ({ getKinstaClient: vi.fn() }));

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

  const environmentTools = [
    ["kinsta_analytics_visits", "visits"],
    ["kinsta_analytics_bandwidth", "bandwidth"],
    ["kinsta_analytics_cdn-bandwidth", "cdn-bandwidth"],
    ["kinsta_analytics_top-countries", "top-countries"],
    ["kinsta_analytics_top-cities", "top-cities"],
    ["kinsta_analytics_top-client-ips", "top-client-ips"],
    ["kinsta_analytics_top-asns", "top-asns"],
    ["kinsta_analytics_top-browsers", "top-browsers"],
    ["kinsta_analytics_top-hosts", "top-hosts"],
    ["kinsta_analytics_top-referrers", "top-referrers"],
    ["kinsta_analytics_top-uas", "top-uas"],
    ["kinsta_analytics_visits-dispersion", "visits-dispersion"],
    ["kinsta_analytics_response-codes", "response-codes"],
  ] as const;

  it("registers all 17 analytics tools", () => {
    expect(ctx.tools.size).toBe(17);
  });

  it("validates IDs and handles auth/API errors", async () => {
    expect(
      await ctx.callTool("kinsta_analytics_visits", { env_id: "../bad" })
    ).toHaveProperty("isError", true);
    mockClientAuthFailure(mock);
    expect(
      await ctx.callTool("kinsta_analytics_visits", { env_id: "env-1" })
    ).toHaveProperty("isError", true);
    mockClientSuccess(mock, ctx);
    mockRequestError(ctx, "SERVER_ERROR", "fail");
    expect(
      await ctx.callTool("kinsta_analytics_visits", { env_id: "env-1" })
    ).toHaveProperty("isError", true);
  });

  it.each(environmentTools)(
    "%s calls the current API path",
    async (name, suffix) => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { data: [] });
      await ctx.callTool(name, {
        env_id: "env-1",
        time_span: "30_days",
        from: "2026-08-01",
        to: "2026-08-31",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith({
        path: `/sites/environments/env-1/analytics/${suffix}`,
        method: "GET",
        params: {
          company_id: "company-123",
          time_span: "30_days",
          from: "2026-08-01",
          to: "2026-08-31",
        },
      });
    }
  );

  it.each([
    ["kinsta_analytics_visits-usage", "visits"],
    ["kinsta_analytics_bandwidth-usage", "bandwidth"],
    ["kinsta_analytics_cdn-bandwidth-usage", "cdn-bandwidth"],
  ])("%s gets this month's site usage", async (name, segment) => {
    mockClientSuccess(mock, ctx);
    mockRequestSuccess(ctx, { data: [] });
    await ctx.callTool(name, { site_id: "site-1" });
    expect(ctx.mockClient.request).toHaveBeenCalledWith({
      path: `/sites/site-1/usage/${segment}/this-month`,
      method: "GET",
    });
  });

  it("validates usage tool IDs and handles auth/API errors", async () => {
    expect(
      await ctx.callTool("kinsta_analytics_visits-usage", {
        site_id: "../bad",
      })
    ).toHaveProperty("isError", true);
    mockClientAuthFailure(mock);
    expect(
      await ctx.callTool("kinsta_analytics_visits-usage", {
        site_id: "site-1",
      })
    ).toHaveProperty("isError", true);
    mockClientSuccess(mock, ctx);
    mockRequestError(ctx, "SERVER_ERROR", "fail");
    expect(
      await ctx.callTool("kinsta_analytics_visits-usage", {
        site_id: "site-1",
      })
    ).toHaveProperty("isError", true);
  });

  it("validates additional analytics IDs and handles auth/API errors", async () => {
    expect(
      await ctx.callTool("kinsta_analytics_top-countries", {
        env_id: "../bad",
      })
    ).toHaveProperty("isError", true);
    mockClientAuthFailure(mock);
    expect(
      await ctx.callTool("kinsta_analytics_top-countries", {
        env_id: "env-1",
      })
    ).toHaveProperty("isError", true);
    mockClientSuccess(mock, ctx);
    mockRequestError(ctx, "SERVER_ERROR", "fail");
    expect(
      await ctx.callTool("kinsta_analytics_top-countries", {
        env_id: "env-1",
      })
    ).toHaveProperty("isError", true);
  });

  it("gets diskspace with the required time zone", async () => {
    mockClientSuccess(mock, ctx);
    mockRequestSuccess(ctx, { data: [] });
    await ctx.callTool("kinsta_analytics_disk-space", {
      env_id: "env-1",
      time_span: "7_days",
      time_zone: "02:00",
    });
    expect(ctx.mockClient.request).toHaveBeenCalledWith({
      path: "/sites/environments/env-1/analytics/diskspace",
      method: "GET",
      params: {
        company_id: "company-123",
        time_span: "7_days",
        time_zone: "02:00",
      },
    });
  });

  it("validates diskspace IDs and handles auth/API errors", async () => {
    expect(
      await ctx.callTool("kinsta_analytics_disk-space", {
        env_id: "../bad",
        time_zone: "02:00",
      })
    ).toHaveProperty("isError", true);
    mockClientAuthFailure(mock);
    expect(
      await ctx.callTool("kinsta_analytics_disk-space", {
        env_id: "env-1",
        time_zone: "02:00",
      })
    ).toHaveProperty("isError", true);
    mockClientSuccess(mock, ctx);
    mockRequestError(ctx, "SERVER_ERROR", "fail");
    expect(
      await ctx.callTool("kinsta_analytics_disk-space", {
        env_id: "env-1",
        time_zone: "02:00",
      })
    ).toHaveProperty("isError", true);
  });
});
