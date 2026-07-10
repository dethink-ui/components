import { defineConfig, devices } from "@playwright/test";

/**
 * Root Playwright config for the Dethink Components workspace.
 *
 * Intentionally minimal: no `webServer` or `baseURL` is bound yet. Point tests
 * at an app when you add specs — e.g. Storybook (`http://localhost:6006`),
 * the Next.js showcase (`http://localhost:3005`), or playground-vite — either
 * by uncommenting the `webServer` block below or with `page.goto(url)` calls.
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
      use: { ...devices["Desktop Chrome"] },
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
