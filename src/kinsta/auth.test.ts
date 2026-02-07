import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loadKinstaConfig,
  isKinstaConfigured,
  KinstaAuthError,
} from "./auth.js";

describe("Kinsta Auth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("loadKinstaConfig", () => {
    it("should throw KinstaAuthError when KINSTA_API_KEY is missing", () => {
      delete process.env["KINSTA_API_KEY"];
      process.env["KINSTA_COMPANY_ID"] = "company-123";

      expect(() => loadKinstaConfig()).toThrow(KinstaAuthError);
      expect(() => loadKinstaConfig()).toThrow("KINSTA_API_KEY");
    });

    it("should throw KinstaAuthError when KINSTA_COMPANY_ID is missing", () => {
      process.env["KINSTA_API_KEY"] = "test-key";
      delete process.env["KINSTA_COMPANY_ID"];

      expect(() => loadKinstaConfig()).toThrow(KinstaAuthError);
      expect(() => loadKinstaConfig()).toThrow("KINSTA_COMPANY_ID");
    });

    it("should return config when all required env vars are set", () => {
      process.env["KINSTA_API_KEY"] = "test-key";
      process.env["KINSTA_COMPANY_ID"] = "company-123";

      const config = loadKinstaConfig();

      expect(config.apiKey).toBe("test-key");
      expect(config.companyId).toBe("company-123");
      expect(config.baseUrl).toBe("https://api.kinsta.com/v2");
    });

    it("should respect custom KINSTA_API_BASE_URL", () => {
      process.env["KINSTA_API_KEY"] = "test-key";
      process.env["KINSTA_COMPANY_ID"] = "company-123";
      process.env["KINSTA_API_BASE_URL"] = "https://custom.api.com/v3";

      const config = loadKinstaConfig();

      expect(config.baseUrl).toBe("https://custom.api.com/v3");
    });
  });

  describe("isKinstaConfigured", () => {
    it("should return false when KINSTA_API_KEY is missing", () => {
      delete process.env["KINSTA_API_KEY"];
      process.env["KINSTA_COMPANY_ID"] = "company-123";

      expect(isKinstaConfigured()).toBe(false);
    });

    it("should return false when KINSTA_COMPANY_ID is missing", () => {
      process.env["KINSTA_API_KEY"] = "test-key";
      delete process.env["KINSTA_COMPANY_ID"];

      expect(isKinstaConfigured()).toBe(false);
    });

    it("should return true when both env vars are set", () => {
      process.env["KINSTA_API_KEY"] = "test-key";
      process.env["KINSTA_COMPANY_ID"] = "company-123";

      expect(isKinstaConfigured()).toBe(true);
    });
  });
});
