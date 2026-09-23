import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "voice-input.spec.ts",
  workers: 1,
  timeout: 45_000,
  reporter: "list",
  use: {
    baseURL: process.env.VOICE_INPUT_BASE_URL ?? "http://localhost:5291",
    viewport: { width: 1280, height: 900 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: {
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
          ],
        },
      },
    },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: process.env.VOICE_INPUT_BASE_URL
    ? undefined
    : {
        command:
          "node apps/showcase/node_modules/next/dist/bin/next dev apps/showcase --port 5291",
        url: "http://localhost:5291/components/voice-input",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
