import { expect, test } from "@playwright/test";

const recipePath = "/recipes/command-center-dashboard";
const recipeSlugs = [
  "login-and-onboarding",
  "saas-landing-page",
  "dethink-labs-security",
  "command-center-dashboard",
  "crud-resource-manager",
  "settings-and-billing",
  "ai-workspace",
  "customer-support-copilot",
  "scheduler-and-booking",
  "saas-checkout-order-summary",
];

test.describe("showcase full-page recipe shell", () => {
  test("puts the representative product in the first desktop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(recipePath);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Command-center dashboard",
      }),
    ).toBeVisible();

    const preview = page.locator(
      '[data-recipe-preview="command-center-dashboard"]',
    );
    const layoutWidth = await page.evaluate(() => document.body.clientWidth);
    const previewBounds = await preview.boundingBox();
    const detailsBounds = await page
      .getByRole("heading", {
        level: 2,
        name: "Command-center dashboard",
      })
      .boundingBox();

    expect(previewBounds).not.toBeNull();
    expect(previewBounds!.x).toBe(0);
    expect(previewBounds!.width).toBe(layoutWidth);
    expect(previewBounds!.y).toBeLessThanOrEqual(120);
    expect(previewBounds!.y + previewBounds!.height).toBeGreaterThanOrEqual(
      900,
    );
    expect(detailsBounds).not.toBeNull();
    expect(detailsBounds!.y).toBeGreaterThanOrEqual(900);
    await expect(
      page.locator('[data-recipe-surface="command-center-dashboard"]'),
    ).toHaveCSS("border-top-left-radius", "0px");
  });

  test("keeps demo navigation and source in natural keyboard order", async ({
    page,
  }) => {
    await page.goto(recipePath);

    const controls = page.getByRole("navigation", {
      name: "Recipe demo controls",
    });
    const back = controls.getByRole("link", { name: "Recipes" });
    const details = controls.getByRole("link", { name: "Details" });
    const source = controls.getByRole("link", { name: "Source" });

    await back.focus();
    await expect(back).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(details).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(source).toBeFocused();

    await source.click();
    await expect(page).toHaveURL(/#recipe-source-heading$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Source" }),
    ).toBeInViewport();

    await back.click();
    await expect(page).toHaveURL(/\/recipes$/);
  });

  test("fills mobile without document overflow or spatial bar motion", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(recipePath);

    const preview = page.locator(
      '[data-recipe-preview="command-center-dashboard"]',
    );
    const layoutWidth = await page.evaluate(() => document.body.clientWidth);
    const previewBounds = await preview.boundingBox();

    expect(previewBounds).not.toBeNull();
    expect(previewBounds!.x).toBe(0);
    expect(previewBounds!.width).toBe(layoutWidth);
    expect(previewBounds!.y).toBeLessThanOrEqual(120);
    expect(previewBounds!.y + previewBounds!.height).toBeGreaterThanOrEqual(
      844,
    );
    await expect(page.locator("[data-recipe-demo-bar]")).toHaveCSS(
      "transform",
      "none",
    );
    await expect(
      page.getByRole("button", { name: "Open sidebar" }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  });

  test("applies the full-page contract to every recipe", async ({ page }) => {
    test.slow();

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);

      for (const slug of recipeSlugs) {
        await page.goto(`/recipes/${slug}`);

        const preview = page.locator(`[data-recipe-preview="${slug}"]`);
        const surface = page.locator(`[data-recipe-surface="${slug}"]`);
        const previewBounds = await preview.boundingBox();
        const layoutWidth = await page.evaluate(
          () => document.body.clientWidth,
        );

        expect(previewBounds, `${slug} preview bounds`).not.toBeNull();
        expect(previewBounds!.x, `${slug} preview start`).toBe(0);
        expect(previewBounds!.width, `${slug} preview width`).toBe(layoutWidth);
        expect(previewBounds!.y, `${slug} preview top`).toBeLessThanOrEqual(
          120,
        );
        expect(
          previewBounds!.y + previewBounds!.height,
          `${slug} preview first viewport`,
        ).toBeGreaterThanOrEqual(viewport.height);
        await expect(surface, `${slug} full-page surface`).toBeVisible();
        await expect
          .poll(
            () =>
              page.evaluate(
                () => document.documentElement.scrollWidth <= window.innerWidth,
              ),
            { message: `${slug} document overflow` },
          )
          .toBe(true);
      }
    }
  });
});
