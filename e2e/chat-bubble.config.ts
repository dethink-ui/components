import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "chat-bubble.spec.ts",
  workers: 1,
  timeout: 45_000,
  reporter: "list",
  use: {
    baseURL: process.env.CHAT_BUBBLE_BASE_URL ?? "http://localhost:5291",
    viewport: { width: 1280, height: 900 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: process.env.CHAT_BUBBLE_BASE_URL
    ? undefined
    : {
        command:
          "node apps/showcase/node_modules/next/dist/bin/next dev apps/showcase --port 5291",
        url: "http://localhost:5291/components/chat-bubble",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
