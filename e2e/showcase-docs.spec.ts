import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("takes a new reader from setup to a component and its props", async ({
  page,
}) => {
  await page.goto("/docs");
  await page
    .getByRole("link", { name: "Set up your project", exact: false })
    .click();
  await expect(page).toHaveURL(/\/docs\/installation$/);
  await expect(
    page.getByRole("heading", { name: "3. Add styles and a provider" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Try your first component: Button" })
    .click();
  await expect(page).toHaveURL(/\/components\/button$/);
  await expect(page.locator("article h2")).toHaveText([
    "Installation",
    "Usage",
    "Examples",
    "Props",
  ]);
  const contents = page.locator('aside nav[aria-label="On this page"]');
  await contents.getByRole("link", { name: "Props", exact: true }).click();
  await expect(page).toHaveURL(/#props-heading$/);
  await expect(
    page.getByRole("table", { name: "Button props" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("columnheader", { name: "What it does" }),
  ).toBeVisible();
  await expect(
    page.getByRole("rowheader", { name: /^loading / }),
  ).toBeVisible();
});

test("keeps section links and props usable on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/input");
  await page.locator("article > details > summary").press("Enter");
  await page
    .locator('article nav[aria-label="On this page"]')
    .getByRole("link", { name: "Props", exact: true })
    .click();
  await expect(page).toHaveURL(/#props-heading$/);
  await expect(
    page.getByRole("table", { name: "Input props" }),
  ).toBeInViewport();
  const scrollRegion = page.getByRole("region", { name: "Input props" });
  await scrollRegion.focus();
  await expect(scrollRegion).toBeFocused();
  const widths = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport);
});

test("has valid section links and accessible getting-started pages", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/docs",
    "/docs/installation",
    "/docs/theming",
    "/components/button",
  ]) {
    await page.goto(route);
    const targets = await page
      .locator('aside nav[aria-label="On this page"] a')
      .evaluateAll((links) =>
        links.map((link) => {
          const id = link.getAttribute("href")!.slice(1);
          return {
            id,
            count: document.querySelectorAll(`[id="${id}"]`).length,
          };
        }),
      );
    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) expect(target.count, target.id).toBe(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
});

test("lets keyboard users skip repeated navigation", async ({ page }) => {
  await page.goto("/docs");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});
