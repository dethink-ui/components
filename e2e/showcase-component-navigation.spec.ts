import { expect, test } from "@playwright/test";

test.describe("showcase component documentation navigation", () => {
  test("uses the sidebar without duplicate page navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/components/navdock");
    await expect(
      page.getByRole("navigation", { name: "Adjacent components" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "Switch component" }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Browse documentation", { exact: true }),
    ).toHaveCount(0);
    const navigation = page.getByRole("navigation", {
      name: "Components",
      exact: true,
    });
    await expect(navigation.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      "/components/navdock",
    );
    await navigation
      .getByRole("link", { name: "Navigation Menu", exact: true })
      .click();
    await expect(page).toHaveURL(/\/components\/navigation-menu$/);
    await expect(navigation.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      "/components/navigation-menu",
    );
  });

  test("keeps the catalog accessible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/navdock");
    await expect(
      page.getByRole("navigation", { name: "Adjacent components" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "Switch component" }),
    ).toHaveCount(0);
    await page
      .locator("article header")
      .getByRole("link", { name: "Components", exact: true })
      .click();
    await expect(page).toHaveURL(/\/components$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
});
