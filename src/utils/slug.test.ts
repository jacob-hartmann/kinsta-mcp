import { describe, it, expect } from "vitest";
import { mcpSafeName } from "./slug.js";

describe("mcpSafeName", () => {
  it("should keep already-safe names", () => {
    expect(mcpSafeName("Site_1-prod")).toBe("Site_1-prod");
  });

  it("should replace spaces and punctuation", () => {
    expect(mcpSafeName("Site 1 Environments")).toBe("Site_1_Environments");
  });

  it("should trim leading and trailing underscores", () => {
    expect(mcpSafeName("  !!Hello World!!  ")).toBe("Hello_World");
  });

  it("should fall back to unnamed for empty input", () => {
    expect(mcpSafeName("   ")).toBe("unnamed");
    expect(mcpSafeName("***")).toBe("unnamed");
  });

  it("should cap names at 64 characters", () => {
    const long = "a".repeat(80);
    expect(mcpSafeName(long)).toHaveLength(64);
  });
});
