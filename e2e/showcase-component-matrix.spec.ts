import { expect, test } from "@playwright/test";

test.describe("showcase component matrix", () => {
  test("describes static states truthfully and keeps one navigation action per card", async ({
    page,
  }) => {
    await page.goto("/");

    const matrix = page.getByRole("list", {
      name: "Component state previews",
    });
    await expect(
      page.getByText("State previews · open docs to interact"),
    ).toBeVisible();
    await expect(page.getByText("Hover = live preview")).toHaveCount(0);
    await expect(matrix.getByRole("link")).toHaveCount(12);

    const cards = matrix.locator(":scope > li > article");
    await expect(cards).toHaveCount(11);
    await expect
      .poll(async () =>
        cards.evaluateAll((articles) =>
          articles.every((article) => {
            const actions = article.querySelectorAll(
              "a[href], button, input, select, textarea, [role=button], [role=checkbox], [role=combobox], [role=switch]",
            );
            const availableActions = [...actions].filter(
              (action) => !action.closest("[inert]"),
            );

            return (
              availableActions.length === 1 &&
              availableActions[0]?.matches('a[href^="/components/"]')
            );
          }),
        ),
      )
      .toBe(true);

    const buttonLink = matrix.getByRole("link", {
      name: "Button",
      exact: true,
    });
    await buttonLink.focus();
    await expect(buttonLink).toBeFocused();
    await expect
      .poll(() =>
        buttonLink
          .locator("xpath=ancestor::article")
          .evaluate((article) => getComputedStyle(article).boxShadow),
      )
      .not.toBe("none");
  });

  test("keeps preview panels and names legible at desktop and mobile widths", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const matrix = page.getByRole("list", {
      name: "Component state previews",
    });
    const firstCard = matrix.locator(":scope > li > article").first();
    const firstPreview = firstCard.locator("[inert]");
    const firstName = firstCard.getByRole("heading", { level: 3 });
    await firstCard.scrollIntoViewIfNeeded();

    const desktopCard = await firstCard.boundingBox();
    const desktopPreview = await firstPreview.boundingBox();
    expect(desktopCard).not.toBeNull();
    expect(desktopPreview).not.toBeNull();
    expect(desktopCard!.width).toBeGreaterThan(250);
    expect(desktopPreview!.height).toBeGreaterThanOrEqual(90);
    await expect(firstName).toHaveCSS("font-size", "15px");

    await page.setViewportSize({ width: 390, height: 844 });
    await firstCard.scrollIntoViewIfNeeded();
    const mobileCard = await firstCard.boundingBox();
    const mobilePreview = await firstPreview.boundingBox();
    expect(mobileCard).not.toBeNull();
    expect(mobilePreview).not.toBeNull();
    expect(mobileCard!.width).toBeGreaterThan(160);
    expect(mobilePreview!.width).toBeLessThanOrEqual(mobileCard!.width);
    await expect(firstName).toBeVisible();
  });

  test("removes spatial entrance motion when reduced motion is requested", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const firstItem = page
      .getByRole("list", { name: "Component state previews" })
      .locator(":scope > li")
      .first();
    await firstItem.scrollIntoViewIfNeeded();
    await expect(firstItem).toHaveCSS("transform", "none");
    await expect(firstItem.getByRole("link", { name: "Button" })).toBeVisible();
  });
});
