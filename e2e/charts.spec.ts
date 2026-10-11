import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const themes = ["light", "dark"] as const;

async function setTheme(page: Page, theme: (typeof themes)[number]) {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate((value) => {
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
  }, theme);
}

// Charts measure themselves after mount; wait until every plot has.
async function chartsReady(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-slot="chart-container"]')].every(
          (node) => node.hasAttribute("data-measured"),
        ),
      ),
    )
    .toBe(true);
}

for (const kind of ["line", "area", "bar"] as const) {
  test(`${kind} chart page: first example in both themes`, async ({ page }) => {
    await page.goto(`/components/${kind}-chart`);
    const chart = page.locator(`[data-slot="${kind}-chart"]`).first();
    await chart.scrollIntoViewIfNeeded();
    for (const theme of themes) {
      await setTheme(page, theme);
      await chartsReady(page);
      await expect(chart).toHaveScreenshot(`${kind}-chart-${theme}.png`);
    }
  });
}

test.describe("command-center dashboard recipe", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recipes/command-center-dashboard");
    await chartsReady(page);
  });

  test("renders real KPI tiles, charts and a bar list", async ({ page }) => {
    const surface = page.locator(
      '[data-recipe-surface="command-center-dashboard"]',
    );
    await expect(surface.locator('[data-slot="stat-tile"]')).toHaveCount(4);
    await expect(
      surface.getByRole("application", { name: "API latency" }),
    ).toHaveAttribute("aria-roledescription", "area chart");
    await expect(
      surface.getByRole("list", { name: "Alert sources" }),
    ).toBeVisible();

    const load = surface.getByRole("application", { name: "Incident load" });
    await load.focus();
    await load.press("Home");
    await expect(surface.locator('[data-slot="bar-chart-readout"]')).toHaveText(
      "-11h: Opened 3, Resolved 4",
    );
    await load.press("Escape");
  });

  for (const theme of themes) {
    test(`chart band visuals, ${theme}`, async ({ page }) => {
      await setTheme(page, theme);
      const metrics = page.getByRole("region", { name: "Key metrics" });
      await metrics.scrollIntoViewIfNeeded();
      await expect(metrics).toHaveScreenshot(`recipe-kpis-${theme}.png`);
      const latency = page
        .getByRole("application", { name: "API latency" })
        .locator("xpath=ancestor::*[@data-slot='card'][1]");
      await latency.scrollIntoViewIfNeeded();
      await expect(latency).toHaveScreenshot(`recipe-latency-${theme}.png`);
      const load = page
        .getByRole("application", { name: "Incident load" })
        .locator("xpath=ancestor::*[@data-slot='card'][1]");
      await load.scrollIntoViewIfNeeded();
      await expect(load).toHaveScreenshot(`recipe-load-${theme}.png`);
    });
  }

  test("chart band on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await chartsReady(page);
    const load = page
      .getByRole("application", { name: "Incident load" })
      .locator("xpath=ancestor::*[@data-slot='card'][1]");
    await load.scrollIntoViewIfNeeded();
    const box = await load.boundingBox();
    // No horizontal overflow at phone width.
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    await expect(load).toHaveScreenshot("recipe-load-mobile.png");
  });

  test("has no axe violations in the chart band", async ({ page }) => {
    // Scoped to the chart components: the recipe's sidebar shell is covered by
    // its own checks.
    let builder = new AxeBuilder({ page });
    for (const slot of ["kpi-group", "area-chart", "bar-list", "bar-chart"]) {
      builder = builder.include(
        `[data-recipe-surface="command-center-dashboard"] [data-slot="${slot}"]`,
      );
    }
    const results = await builder.analyze();
    expect(results.violations).toEqual([]);
  });
});
