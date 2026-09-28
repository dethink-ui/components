import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

export default defineConfig({
  testDir: ".",
  testMatch: "charts.spec.ts",
  workers: 1,
  reporter: "list",
  expect: {
    toHaveScreenshot: {
      // Charts are antialiased SVG; allow sub-pixel differences only.
      maxDiffPixelRatio: 0.002,
      stylePath: fileURLToPath(
        new URL("./sidebar-shell.screenshot.css", import.meta.url),
      ),
    },
  },
  use: {
    baseURL: process.env.CHARTS_BASE_URL ?? "http://localhost:5291",
    viewport: { width: 1280, height: 900 },
    // Entrance motion is motion-safe only, so screenshots see final geometry.
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: ["chromium", "webkit"].map((browserName) => ({
    name: browserName,
    use: { browserName: browserName as "chromium" | "webkit" },
  })),
});
