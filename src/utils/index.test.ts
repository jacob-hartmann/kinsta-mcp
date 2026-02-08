import { describe, it, expect } from "vitest";
import { escapeHtml } from "./index.js";

describe("utils barrel export", () => {
  it("should export escapeHtml", () => {
    expect(typeof escapeHtml).toBe("function");
  });
});
