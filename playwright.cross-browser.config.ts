import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: [
    "showcase-recipes-gallery.spec.ts",
    "showcase-docs.spec.ts",
    "date-time-picker.spec.ts",
    "showcase-navdock-motion.spec.ts",
  ],
  projects: [
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
