import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const representativeSlugs = [
  "command-center-dashboard",
  "saas-landing-page",
  "login-and-onboarding",
];
const baseUrl = process.env.SHOWCASE_BASE_URL ?? "http://127.0.0.1:3015";
const outputDirectory = path.resolve("apps/showcase/public/recipe-captures");
const viewport = { width: 1440, height: 1200 };
// A shorter desktop viewport keeps the bounded chat composer in the thumbnail.
const recipeViewports = {
  "ai-chat-studio": { width: 1440, height: 780 },
};
const capture = { width: 1200, height: 675 };

async function discoverRecipeSlugs(page) {
  await page.goto(`${baseUrl}/recipes`, { waitUntil: "networkidle" });

  return page
    .getByRole("list", { name: "Recipe results" })
    .getByRole("link")
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href"))
        .filter((href) => href?.startsWith("/recipes/"))
        .map((href) => href.replace("/recipes/", "")),
    );
}

async function captureRecipe(page, slug) {
  await page.setViewportSize(recipeViewports[slug] ?? viewport);
  await page.goto(`${baseUrl}/recipes/${slug}`, { waitUntil: "networkidle" });
  await page.evaluate(() => globalThis.document.fonts.ready);

  if (slug === "ai-chat-studio") {
    await page.locator('[data-slot="chat"][data-hydrated="true"]').waitFor();
    await page.getByRole("button", { name: "Next response version" }).click();
  }

  const preview = page.locator(`[data-recipe-preview="${slug}"]`);
  await preview.waitFor({ state: "visible" });

  const bounds = await preview.boundingBox();

  if (!bounds) {
    throw new Error(`Could not measure the ${slug} recipe preview.`);
  }

  if (bounds.width < capture.width || bounds.height < capture.height) {
    throw new Error(
      `${slug} is ${Math.round(bounds.width)}×${Math.round(bounds.height)}; ` +
        `the capture contract requires at least ${capture.width}×${capture.height}.`,
    );
  }

  const outputPath = path.join(
    outputDirectory,
    `${slug}--teal-light-default@1x.png`,
  );

  await page.screenshot({
    animations: "disabled",
    caret: "hide",
    clip: {
      x: Math.round(bounds.x + (bounds.width - capture.width) / 2),
      y: Math.round(bounds.y),
      width: capture.width,
      height: capture.height,
    },
    path: outputPath,
    scale: "css",
  });

  return outputPath;
}

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  colorScheme: "light",
  deviceScaleFactor: 1,
  locale: "en-GB",
  reducedMotion: "reduce",
  viewport,
});

await context.addInitScript(() => {
  globalThis.localStorage.setItem("dethink-brand", "teal");
  globalThis.localStorage.setItem("dethink-theme", "light");
});

const page = await context.newPage();
const requestedSlugs = process.argv
  .slice(2)
  .filter((value) => value !== "--all");
const slugs = process.argv.includes("--all")
  ? await discoverRecipeSlugs(page)
  : requestedSlugs.length > 0
    ? requestedSlugs
    : representativeSlugs;

try {
  for (const slug of slugs) {
    const outputPath = await captureRecipe(page, slug);
    console.log(path.relative(process.cwd(), outputPath));
  }
} finally {
  await browser.close();
}
