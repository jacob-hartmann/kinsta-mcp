import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/**/__test-helpers__/**",
        "src/index.ts",
        "src/kinsta/index.ts",
        "src/utils/index.ts",
      ],
      thresholds: {
        lines: 100,
        branches: 100,
        statements: 100,
        functions: 100,
      },
    },
    testTimeout: 10000,
  },
});
