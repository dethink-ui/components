import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const baseURL = process.env.SHADER_HERO_BASE_URL ?? "http://localhost:5279";

export default defineConfig({
  testDir: ".",
  testMatch: "shader-hero-text.spec.ts",
  fullyParallel: false,
  timeout: 30_000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "webkit", use: { browserName: "webkit" } },
    { name: "firefox", use: { browserName: "firefox" } },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
        launchOptions: { args: ["--enable-unsafe-swiftshader"] },
      },
    },
  ],
  webServer: {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    command:
      "node apps/showcase/node_modules/next/dist/bin/next dev apps/showcase --webpack --port 5279",
    url: `${baseURL}/components/shader-hero-text`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
