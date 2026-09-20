import { expect, test } from "@playwright/test";

test.describe("showcase example source disclosure", () => {
  test("keeps previews visible and source collapsed by default", async ({
    page,
  }) => {
    await page.goto("/components/button");

    const example = page.locator('section[aria-labelledby="variants"]');
    const source = example.locator("#variants-source");

    await expect(example.getByRole("button", { name: "Solid" })).toBeVisible();
    await expect(source).not.toHaveAttribute("open", "");
    await expect(source.locator("summary")).toHaveAccessibleName(
      "Show source for Variants",
    );
    await expect(source.locator(".sc-code-block")).toBeHidden();
  });

  test("opens from the keyboard and keeps source copyable", async ({
    context,
    page,
    baseURL,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: new URL(baseURL!).origin,
    });
    await page.goto("/components/button");

    const source = page.locator("#variants-source");
    const disclosure = source.locator("summary");

    await disclosure.focus();
    await page.keyboard.press("Enter");

    await expect(source).toHaveAttribute("open", "");
    await expect(disclosure).toHaveAccessibleName("Hide source for Variants");
    await expect(disclosure).toBeFocused();
    await expect(source.locator(".sc-code-block")).toBeVisible();

    await source.getByRole("button", { name: "Copy code" }).click();
    await expect(source.getByRole("button", { name: "Copied" })).toBeVisible();
  });

  test("opens a source deep link and preserves collapsed source in the DOM", async ({
    page,
  }) => {
    await page.goto("/components/button#variants-source");

    const source = page.locator("#variants-source");
    await expect(source).toHaveAttribute("open", "");
    await expect(source.locator(".sc-code-block")).toBeVisible();

    await page.goto("/components/button");
    await expect(page.locator("#variants-source")).not.toHaveAttribute(
      "open",
      "",
    );
    await expect(page.locator("#variants-source")).toContainText(
      "export function ButtonVariants",
    );
  });

  test("keeps mobile scanning compact with reduced motion", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/button");

    const source = page.locator("#variants-source");
    const sizesHeading = page.getByRole("heading", {
      name: "Sizes",
      exact: true,
    });

    await expect(source.locator(".sc-code-block")).toBeHidden();
    const sizesBounds = await sizesHeading.boundingBox();
    const variantsBounds = await page
      .getByRole("heading", { name: "Variants", exact: true })
      .boundingBox();
    expect(sizesBounds).not.toBeNull();
    expect(variantsBounds).not.toBeNull();
    // The example remains compact regardless of the setup content above it.
    expect(sizesBounds!.y - variantsBounds!.y).toBeLessThan(650);

    await source.locator("summary").click();
    await expect(source.locator(".sc-code-block")).toBeVisible();
    await expect(
      source.locator('[data-slot="example-source-content"]'),
    ).toHaveCSS("transform", "none");
  });
});
