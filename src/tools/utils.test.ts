import { describe, it, expect } from "vitest";
import {
  formatError,
  formatAuthError,
  formatValidationError,
  formatSuccess,
  formatMessage,
  buildParams,
  validateId,
} from "./utils.js";

describe("Tool Utilities", () => {
  describe("formatError", () => {
    it("should format error with code and message", () => {
      const result = formatError({
        code: "SERVER_ERROR",
        message: "Internal error",
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("SERVER_ERROR");
      expect(result.content[0]?.text).toContain("Internal error");
    });

    it("should use mapped message for UNAUTHORIZED", () => {
      const result = formatError({ code: "UNAUTHORIZED", message: "raw" });

      expect(result.content[0]?.text).toContain("invalid or expired");
    });

    it("should use mapped message for RATE_LIMITED", () => {
      const result = formatError({ code: "RATE_LIMITED", message: "raw" });

      expect(result.content[0]?.text).toContain("rate limit");
    });

    it("should use custom not-found message when resourceType is given", () => {
      const result = formatError({ code: "NOT_FOUND", message: "raw" }, "site");

      expect(result.content[0]?.text).toContain("site was not found");
    });

    it("should use raw message for NOT_FOUND without resourceType", () => {
      const result = formatError({ code: "NOT_FOUND", message: "raw msg" });
      expect(result.content[0]?.text).toContain("raw msg");
    });

    it("should use mapped message for FORBIDDEN", () => {
      const result = formatError({ code: "FORBIDDEN", message: "raw" });
      expect(result.content[0]?.text).toContain("does not have permission");
    });
  });

  describe("formatAuthError", () => {
    it("should format authentication error", () => {
      const result = formatAuthError("Missing API key");

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Authentication Error");
      expect(result.content[0]?.text).toContain("Missing API key");
    });
  });

  describe("formatValidationError", () => {
    it("should format validation error", () => {
      const result = formatValidationError("Invalid site ID");

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Error: Invalid site ID");
    });
  });

  describe("formatSuccess", () => {
    it("should format data as JSON", () => {
      const result = formatSuccess({ name: "test" });

      expect(result.content[0]?.text).toContain('"name": "test"');
    });

    it("should not include structuredContent for non-object data", () => {
      const result = formatSuccess(null);
      expect(result.structuredContent).toBeUndefined();
    });
  });

  describe("formatMessage", () => {
    it("should format plain message", () => {
      const result = formatMessage("Hello!");

      expect(result.content[0]?.text).toBe("Hello!");
    });
  });

  describe("buildParams", () => {
    it("should filter out undefined values", () => {
      const result = buildParams({
        name: "Site",
        description: undefined,
        region: "us-east-1",
      });

      expect(result).toEqual({ name: "Site", region: "us-east-1" });
    });

    it("should keep falsy but defined values", () => {
      const result = buildParams({
        name: "",
        count: 0,
        active: false,
      });

      expect(result).toEqual({ name: "", count: 0, active: false });
    });
  });

  describe("validateId", () => {
    it("should return null for valid IDs", () => {
      expect(validateId("abc-123_XYZ", "site_id")).toBeNull();
    });

    it("should return error for invalid IDs", () => {
      const result = validateId("../etc/passwd", "site_id");
      expect(result).toBe("Invalid site_id: contains illegal characters");
    });
  });
});
