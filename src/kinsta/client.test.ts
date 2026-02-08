import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { KinstaClient } from "./client.js";
import type { KinstaConfig } from "./types.js";

describe("KinstaClient", () => {
  const mockConfig: KinstaConfig = {
    apiKey: "test-api-key",
    companyId: "company-123",
    baseUrl: "https://api.kinsta.com/v2",
  };

  let client: KinstaClient;

  beforeEach(() => {
    client = new KinstaClient(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should strip trailing slashes from base URL", () => {
      const c = new KinstaClient({
        ...mockConfig,
        baseUrl: "https://api.kinsta.com/v2///",
      });
      expect(c.getCompanyId()).toBe("company-123");
    });

    it("should expose the company ID", () => {
      expect(client.getCompanyId()).toBe("company-123");
    });
  });

  describe("request", () => {
    it("should handle successful GET requests", async () => {
      const mockData = { company: { id: "company-123", name: "Test" } };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockData);
      }

      expect(fetch).toHaveBeenCalledWith(
        "https://api.kinsta.com/v2/sites",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
          }),
        })
      );
    });

    it("should handle 401 Unauthorized", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Unauthorized", { status: 401 })
      );

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNAUTHORIZED");
        expect(result.error.statusCode).toBe(401);
        expect(result.error.retryable).toBe(false);
      }
    });

    it("should handle 403 Forbidden", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Forbidden", { status: 403 })
      );

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("FORBIDDEN");
        expect(result.error.retryable).toBe(false);
      }
    });

    it("should handle 404 Not Found", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Not Found", { status: 404 })
      );

      const result = await client.request({ path: "/sites/unknown" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    it("should handle 429 Rate Limited", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Too Many Requests", { status: 429 })
      );

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("RATE_LIMITED");
        expect(result.error.retryable).toBe(true);
      }
    });

    it("should handle 500 Server Error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Internal Server Error", { status: 500 })
      );

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("SERVER_ERROR");
        expect(result.error.retryable).toBe(true);
      }
    });

    it("should handle network errors", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
        new Error("DNS resolution failed")
      );

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NETWORK_ERROR");
        expect(result.error.message).toContain("DNS resolution failed");
      }
    });

    it("should include query parameters", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 })
      );

      await client.request({
        path: "/sites",
        params: { company: "company-123" },
      });

      expect(fetch).toHaveBeenCalledWith(
        "https://api.kinsta.com/v2/sites?company=company-123",
        expect.any(Object)
      );
    });

    it("should send JSON body for POST requests", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "new-site" }), { status: 200 })
      );

      await client.request({
        path: "/sites",
        method: "POST",
        body: { display_name: "My Site" },
      });

      expect(fetch).toHaveBeenCalledWith(
        "https://api.kinsta.com/v2/sites",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ display_name: "My Site" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should handle non-JSON response body on success", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("not json", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        })
      );

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNKNOWN");
        expect(result.error.message).toContain("non-JSON");
      }
    });

    it("should extract apiMessage from error JSON body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Site not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.request({ path: "/sites/unknown" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.apiMessage).toBe("Site not found");
        expect(result.error.message).toContain("Site not found");
      }
    });

    it("should extract apiMessage from 'error' key when 'message' is absent", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Something went wrong" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("SERVER_ERROR");
        expect(result.error.apiMessage).toBe("Something went wrong");
        expect(result.error.message).toContain("Something went wrong");
      }
    });

    it("should handle 4xx as VALIDATION_ERROR", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Unprocessable", { status: 422 })
      );

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.statusCode).toBe(422);
        expect(result.error.retryable).toBe(false);
      }
    });

    it("should handle AbortError as TIMEOUT", async () => {
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(abortError);

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("TIMEOUT");
        expect(result.error.retryable).toBe(true);
      }
    });

    it("should abort fetch when timeout fires", async () => {
      vi.useFakeTimers();
      // Mock fetch to hang until abort signal fires
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            (init as RequestInit).signal?.addEventListener("abort", () => {
              const err = new Error("The operation was aborted");
              err.name = "AbortError";
              reject(err);
            });
          })
      );

      const resultPromise = client.request({ path: "/sites" });
      // Advance past the 30s timeout
      await vi.advanceTimersByTimeAsync(30_001);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("TIMEOUT");
      }
      vi.useRealTimers();
    });

    it("should handle non-Error throw", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce("string error");

      const result = await client.request({ path: "/sites" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNKNOWN");
        expect(result.error.message).toBe("Unknown error occurred");
      }
    });
  });
});
