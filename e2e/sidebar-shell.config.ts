import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

export default defineConfig({
  testDir: ".",
  testMatch: "sidebar-shell.spec.ts",
  workers: 1,
  reporter: "list",
  expect: {
    toHaveScreenshot: {
      stylePath: fileURLToPath(
        new URL("./sidebar-shell.screenshot.css", import.meta.url),
      ),
    },
  },
  use: {
    baseURL: process.env.SIDEBAR_SHELL_BASE_URL ?? "http://localhost:5291",
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: ["chromium", "webkit"].map((browserName) => ({
    name: browserName,
    use: { browserName: browserName as "chromium" | "webkit" },
  })),
});
