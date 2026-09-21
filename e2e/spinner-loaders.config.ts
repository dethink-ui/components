import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "spinner-loaders.spec.ts",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5291",
    viewport: { width: 1280, height: 900 },
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    cwd: new URL("..", import.meta.url).pathname,
    command:
      "node apps/showcase/node_modules/next/dist/bin/next dev apps/showcase --webpack --port 5291",
    url: "http://localhost:5291/components/feedback-states",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
