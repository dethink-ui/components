import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

export default defineConfig({
  testDir: ".",
  outputDir: "../test-results/carousel-browser",
  testMatch: "carousel-modes.spec.ts",
  workers: 1,
  timeout: 45_000,
  reporter: "list",
  use: {
    baseURL: process.env.CAROUSEL_BASE_URL ?? "http://localhost:5291",
    viewport: { width: 1440, height: 1100 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: process.env.CAROUSEL_BASE_URL
    ? undefined
    : {
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        command:
          "node apps/showcase/node_modules/next/dist/bin/next dev apps/showcase --port 5291",
        url: "http://localhost:5291/components/carousel",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
