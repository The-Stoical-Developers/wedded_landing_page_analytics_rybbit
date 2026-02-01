import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    environmentMatchGlobs: [
      // Use jsdom for analytics script tests
      ["src/analytics-script/**", "jsdom"],
    ],
    coverage: {
      provider: "v8",
      // WEDDED: Only measure coverage for Wedded-specific code
      include: ["src/wedded/**/*.ts"],
      exclude: [
        "src/wedded/**/*.test.ts",
        "src/wedded/**/types.ts",
        "src/wedded/**/index.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 70,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
