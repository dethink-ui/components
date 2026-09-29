import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

export default defineConfig({
  testDir: ".",
  outputDir: "../test-results/filter-recipes",
  testMatch: "filter-recipes.spec.ts",
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" },
  },
  use: {
    baseURL: process.env.FILTERS_BASE_URL ?? "http://localhost:5293",
    viewport: { width: 1440, height: 1100 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: process.env.FILTERS_BASE_URL
    ? undefined
    : {
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        command:
          "node apps/showcase/node_modules/next/dist/bin/next dev apps/showcase --port 5293",
        url: "http://localhost:5293/recipes/logs-dashboard",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
