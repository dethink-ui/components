import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "button-group.spec.ts",
  fullyParallel: true,
  use: { baseURL: "http://localhost:3005", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm --filter @dethink/showcase dev",
    url: "http://localhost:3005",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
