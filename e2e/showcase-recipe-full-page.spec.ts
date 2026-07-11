import { expect, test } from "@playwright/test";

const recipePath = "/recipes/command-center-dashboard";

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
});
