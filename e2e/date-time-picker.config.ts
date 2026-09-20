import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "date-time-picker.spec.ts",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5280",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command:
      "node apps/showcase/node_modules/next/dist/bin/next dev apps/showcase --webpack --port 5280",
    url: "http://localhost:5280/components/date-time-picker",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
