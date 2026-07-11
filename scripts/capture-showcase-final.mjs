import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = process.env.SHOWCASE_URL ?? "http://127.0.0.1:3015";
const outputDirectory = join(process.cwd(), "docs/showcase/final-captures");

const captures = [
  {
    name: "desktop-home-light",
    route: "/",
    theme: "light",
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "desktop-components-dark",
    route: "/components",
    theme: "dark",
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "desktop-button-light",
    route: "/components/button",
    theme: "light",
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "desktop-recipes-dark",
    route: "/recipes",
    theme: "dark",
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "mobile-home-dark",
    route: "/",
    theme: "dark",
    viewport: { width: 390, height: 844 },
  },
  {
    name: "mobile-components-light",
    route: "/components",
    theme: "light",
    viewport: { width: 390, height: 844 },
  },
  {
    name: "mobile-button-dark",
    route: "/components/button",
    theme: "dark",
    viewport: { width: 390, height: 844 },
  },
  {
    name: "mobile-recipes-light",
    route: "/recipes",
    theme: "light",
    viewport: { width: 390, height: 844 },
  },
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-gpu"],
});

try {
  for (const capture of captures) {
    const context = await browser.newContext({
      colorScheme: capture.theme,
      reducedMotion: "reduce",
      viewport: capture.viewport,
    });
    await context.addInitScript((theme) => {
      localStorage.setItem("dethink-theme", theme);
      localStorage.setItem("dethink-brand", "teal");
    }, capture.theme);

    const page = await context.newPage();
    await page.goto(new URL(capture.route, baseUrl).toString(), {
      waitUntil: "networkidle",
    });
    await page.locator("html").evaluate(async (root, theme) => {
      if (root.dataset.theme !== theme) {
        throw new Error(`Expected ${theme} theme before capture.`);
      }
      await globalThis.document.fonts.ready;
    }, capture.theme);
    await page.screenshot({
      path: join(outputDirectory, `${capture.name}.png`),
      animations: "disabled",
    });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(
  `Captured ${captures.length} showcase views in ${outputDirectory}.`,
);
