import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "shader-backgrounds.spec.ts",
  timeout: 30_000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5280",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: { args: ["--enable-unsafe-swiftshader"] },
      },
    },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command:
      "node apps/showcase/node_modules/next/dist/bin/next dev apps/showcase --webpack --port 5280",
    url: "http://localhost:5280/components/shader-backgrounds",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
