import { defineConfig, devices } from "@playwright/test";

/**
 * Root Playwright config for the Dethink Components workspace.
 *
 * Builds and serves the production showcase. Local runs can reuse an existing
 * server on port 3015; CI always starts a fresh production server.
 *
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3015",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { args: ["--enable-unsafe-swiftshader"] },
      },
    },
  ],

  webServer: {
    command:
      "pnpm --filter @dethink/showcase build && pnpm --filter @dethink/showcase exec next start --port 3015",
    url: "http://127.0.0.1:3015",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
