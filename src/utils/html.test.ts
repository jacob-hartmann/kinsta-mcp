import { describe, it, expect } from "vitest";
import { escapeHtml } from "./html.js";

describe("escapeHtml", () => {
  it("should escape ampersands", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("should escape less-than signs", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
  });

  it("should escape greater-than signs", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("should escape double quotes", () => {
    expect(escapeHtml('class="x"')).toBe("class=&quot;x&quot;");
  });

  it("should escape all special chars in combined string", () => {
    expect(escapeHtml('<a href="x">&')).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;"
    );
  });

  it("should return empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("should return string without special chars unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});
