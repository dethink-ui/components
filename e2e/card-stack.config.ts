import { defineConfig } from "@playwright/test";
export default defineConfig({
  outputDir: "../test-results/card-stack-e2e",
  testDir: ".",
  testMatch: "card-stack.spec.ts",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.CARD_STACK_BASE_URL ?? "http://localhost:5291",
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: ["chromium", "webkit"].map((browserName) => ({
    name: browserName,
    use: { browserName: browserName as "chromium" | "webkit", hasTouch: true },
  })),
});
