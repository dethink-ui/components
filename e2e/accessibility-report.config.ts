import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";
import base from "../playwright.config";

export default defineConfig({
  ...base,
  testDir: ".",
  testMatch: [
    "showcase-accessibility-report.spec.ts",
    "showcase-release-acceptance.spec.ts",
  ],
  workers: 2,
  retries: 0,
  timeout: 60_000,
  outputDir: "../test-results/accessibility",
  metadata: {
    testedCommit: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    sourceDirty: Boolean(
      execFileSync("git", ["status", "--porcelain", "--untracked-files=no"], {
        encoding: "utf8",
      }).trim(),
    ),
    scope:
      "Representative examples; automated checks, not WCAG certification or screen-reader testing.",
  },
  reporter: [
    ["line"],
    [
      "html",
      {
        outputFolder: resolve("playwright-report/accessibility"),
        open: "never",
      },
    ],
    [
      "json",
      { outputFile: resolve("test-results/accessibility-results.json") },
    ],
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
