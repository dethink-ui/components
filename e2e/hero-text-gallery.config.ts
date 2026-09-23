import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "hero-text-gallery.spec.ts",
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: process.env.HERO_GALLERY_BASE_URL ?? "http://localhost:5291",
    viewport: { width: 1280, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: process.env.HERO_GALLERY_BASE_URL
    ? undefined
    : {
        command:
          "node apps/showcase/node_modules/next/dist/bin/next dev apps/showcase --port 5291",
        url: "http://localhost:5291/components/hero-text-animation",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
