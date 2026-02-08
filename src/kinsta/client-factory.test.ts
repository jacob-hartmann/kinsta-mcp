import { describe, it, expect, vi, beforeEach } from "vitest";

describe("client-factory", () => {
  const mockExtra = {} as any;

  let getKinstaClient: typeof import("./client-factory.js").getKinstaClient;
  let getKinstaClientOrThrow: typeof import("./client-factory.js").getKinstaClientOrThrow;
  let mockLoadKinstaConfig: ReturnType<typeof vi.fn>;
  let clientInstances: any[];

  beforeEach(async () => {
    vi.resetModules();
    clientInstances = [];

    mockLoadKinstaConfig = vi.fn().mockReturnValue({
      apiKey: "key",
      companyId: "company-123",
      baseUrl: "https://api.kinsta.com/v2",
    });

    vi.doMock("./auth.js", () => {
      class KinstaAuthError extends Error {
        code: string;
        constructor(message: string, code: string) {
          super(message);
          this.name = "KinstaAuthError";
          this.code = code;
        }
      }
      return {
        loadKinstaConfig: mockLoadKinstaConfig,
        KinstaAuthError,
      };
    });

    vi.doMock("./client.js", () => {
      return {
        KinstaClient: class MockKinstaClient {
          constructor(_config: any) {
            clientInstances.push(this);
          }
          getCompanyId() {
            return "company-123";
          }
          request = vi.fn();
        },
      };
    });

    const mod = await import("./client-factory.js");
    getKinstaClient = mod.getKinstaClient;
    getKinstaClientOrThrow = mod.getKinstaClientOrThrow;

    // Set env vars for config hash
    process.env["KINSTA_API_KEY"] = "key";
    process.env["KINSTA_COMPANY_ID"] = "company-123";
    delete process.env["KINSTA_API_BASE_URL"];
  });

  it("should create a client on first call (cache miss)", () => {
    const result = getKinstaClient(mockExtra);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.client).toBeDefined();
    }
    expect(clientInstances).toHaveLength(1);
  });

  it("should return cached client on second call (cache hit)", () => {
    const result1 = getKinstaClient(mockExtra);
    const result2 = getKinstaClient(mockExtra);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    if (result1.success && result2.success) {
      expect(result1.client).toBe(result2.client);
    }
    expect(clientInstances).toHaveLength(1);
  });

  it("should invalidate cache when env vars change", () => {
    getKinstaClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    process.env["KINSTA_API_KEY"] = "new-key";
    getKinstaClient(mockExtra);
    expect(clientInstances).toHaveLength(2);
  });

  it("should handle missing env vars in config hash (nullish coalescing)", () => {
    delete process.env["KINSTA_API_KEY"];
    delete process.env["KINSTA_COMPANY_ID"];
    delete process.env["KINSTA_API_BASE_URL"];

    const result = getKinstaClient(mockExtra);
    expect(result.success).toBe(true);
    expect(clientInstances).toHaveLength(1);
  });

  it("should include KINSTA_API_BASE_URL in config hash", () => {
    getKinstaClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    process.env["KINSTA_API_BASE_URL"] = "https://custom.api.com";
    getKinstaClient(mockExtra);
    expect(clientInstances).toHaveLength(2);
  });

  it("should return error when KinstaAuthError is thrown", async () => {
    const { KinstaAuthError } = await import("./auth.js");
    mockLoadKinstaConfig.mockImplementation(() => {
      throw new KinstaAuthError("Missing API key", "NO_API_KEY");
    });

    const result = getKinstaClient(mockExtra);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Missing API key");
    }
  });

  it("should return error when generic Error is thrown", () => {
    mockLoadKinstaConfig.mockImplementation(() => {
      throw new Error("Something went wrong");
    });

    const result = getKinstaClient(mockExtra);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Something went wrong");
    }
  });

  it("should return 'Unknown auth error' when non-Error is thrown", () => {
    mockLoadKinstaConfig.mockImplementation(() => {
      throw "string error";
    });

    const result = getKinstaClient(mockExtra);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Unknown auth error");
    }
  });

  it("should invalidate cache on error", () => {
    // First call succeeds, populating cache
    getKinstaClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    // Make loadKinstaConfig throw
    mockLoadKinstaConfig.mockImplementation(() => {
      throw new Error("fail");
    });

    // Force cache miss by changing env
    process.env["KINSTA_API_KEY"] = "changed";
    const result = getKinstaClient(mockExtra);
    expect(result.success).toBe(false);

    // Now fix it and call again - should create new client (cache was invalidated)
    mockLoadKinstaConfig.mockReturnValue({
      apiKey: "changed",
      companyId: "company-123",
      baseUrl: "https://api.kinsta.com/v2",
    });
    const result2 = getKinstaClient(mockExtra);
    expect(result2.success).toBe(true);
    expect(clientInstances).toHaveLength(2);
  });

  it("getKinstaClientOrThrow should return client on success", () => {
    const client = getKinstaClientOrThrow(mockExtra);
    expect(client).toBeDefined();
  });

  it("getKinstaClientOrThrow should throw on failure", () => {
    mockLoadKinstaConfig.mockImplementation(() => {
      throw new Error("fail");
    });

    expect(() => getKinstaClientOrThrow(mockExtra)).toThrow("fail");
  });
});
