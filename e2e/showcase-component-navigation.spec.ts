import { expect, test } from "@playwright/test";

test.describe("showcase component documentation navigation", () => {
  test("marks the current component on a direct load", async ({ page }) => {
    await page.goto("/components/icon-button");

    await expect(
      page.getByRole("combobox", { name: "Switch component" }),
    ).toHaveValue("Icon Button");
    await expect(
      page.locator('nav[aria-label="Components"] a[aria-current="page"]'),
    ).toHaveAttribute("href", "/components/icon-button");
    await expect(
      page.getByRole("link", { name: "Previous component: Button" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Next component: Button Group" }),
    ).toBeVisible();
  });

  test("searches canonical metadata and switches components", async ({
    page,
  }) => {
    await page.goto("/components/button");

    const switcher = page.getByRole("combobox", { name: "Switch component" });
    await switcher.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await switcher.fill("microphone");
    await page.getByRole("option", { name: /Sound Input/ }).click();

    await expect(page).toHaveURL(/\/components\/sound-input$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "SoundInput" }),
    ).toBeVisible();
    await expect(switcher).toHaveValue("Sound Input");
    await expect(
      page.locator('nav[aria-label="Components"] a[aria-current="page"]'),
    ).toHaveAttribute("href", "/components/sound-input");
  });

  test("follows canonical previous and next order", async ({ page }) => {
    await page.goto("/components/icon-button");

    await page
      .getByRole("link", { name: "Next component: Button Group" })
      .click();
    await expect(page).toHaveURL(/\/components\/button-group$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "ButtonGroup" }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: "Previous component: Icon Button" })
      .click();
    await expect(page).toHaveURL(/\/components\/icon-button$/);
  });

  test("opens, searches, and closes without trapping keyboard focus", async ({
    page,
  }) => {
    await page.goto("/components/button-group");

    const switcher = page.getByRole("combobox", { name: "Switch component" });
    await switcher.focus();
    await expect(page.getByRole("listbox")).toBeVisible();
    await switcher.fill("forms");
    await expect(
      page.getByRole("option", { name: /Form Field/ }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(switcher).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Previous component: Icon Button" }),
    ).toBeFocused();
  });

  test("remains complete on mobile with reduced motion", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/icon-button");

    await expect(
      page.locator('aside nav[aria-label="Components"]'),
    ).toBeHidden();
    await expect(
      page.getByRole("combobox", { name: "Switch component" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Next component: Button Group" }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: "Next component: Button Group" })
      .click();
    await expect(page).toHaveURL(/\/components\/button-group$/);
  });
});
