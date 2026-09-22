import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "async-select.spec.ts",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5291",
    viewport: { width: 1280, height: 900 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
