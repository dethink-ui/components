import { expect, test } from "@playwright/test";

test.describe("showcase component catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components");
    await expect(page.locator("search")).toHaveAttribute(
      "data-hydrated",
      "true",
    );
  });

  test("keeps a consistent gap between component groups", async ({ page }) => {
    const results = page.getByRole("region", {
      name: "Component catalog results",
    });
    const generalBounds = await results
      .getByRole("region", { name: "General" })
      .boundingBox();
    const layoutBounds = await results
      .getByRole("region", { name: "Layout" })
      .boundingBox();

    expect(generalBounds).not.toBeNull();
    expect(layoutBounds).not.toBeNull();

    const groupGap =
      layoutBounds!.y - (generalBounds!.y + generalBounds!.height);

    expect(groupGap).toBeGreaterThanOrEqual(40);
  });

  test("filters by human-readable name and navigates to the component", async ({
    page,
  }) => {
    const search = page.getByRole("searchbox", { name: "Find a component" });
    const results = page.getByRole("region", {
      name: "Component catalog results",
    });
    const resultCount = page.locator("search p[aria-hidden='true']");

    await expect(search).toBeVisible();
    await search.fill("Icon Button");

    await expect(resultCount).toContainText(/1\s*of \d+ components/);
    await expect(
      results.getByRole("link", { name: /Icon Button IconButton/ }),
    ).toBeVisible();
    await expect(results.getByRole("heading", { name: "Layout" })).toHaveCount(
      0,
    );

    await results.getByRole("link", { name: /Icon Button IconButton/ }).click();

    await expect(page).toHaveURL(/\/components\/icon-button$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "IconButton" }),
    ).toBeVisible();
  });

  test("filters by purpose and group, then recovers from no results", async ({
    page,
  }) => {
    const search = page.getByRole("searchbox", { name: "Find a component" });
    const results = page.getByRole("region", {
      name: "Component catalog results",
    });
    const resultCount = page.locator("search p[aria-hidden='true']");

    await search.fill("microphone");
    await expect(
      results.getByRole("link", { name: /Sound Input SoundInput/ }),
    ).toBeVisible();

    await search.fill("forms");
    await expect(results.getByRole("heading", { name: "Forms" })).toBeVisible();
    await expect(
      results.getByRole("heading", { name: "Overlays" }),
    ).toHaveCount(0);

    await search.fill("not-a-real-component");
    await expect(
      page.getByRole("heading", { name: "No components found" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(resultCount).toContainText(/\d+\s*documented components/);
    await expect(
      results.getByRole("heading", { name: "General" }),
    ).toBeVisible();
  });

  test("keeps clear and result navigation in natural keyboard order", async ({
    page,
  }) => {
    const search = page.getByRole("searchbox", { name: "Find a component" });

    await search.focus();
    await search.fill("button group");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Clear component search" }),
    ).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: /Button Group ButtonGroup/ }),
    ).toBeFocused();
  });

  test("remains complete on mobile with reduced motion", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.locator("search")).toHaveAttribute(
      "data-hydrated",
      "true",
    );

    const search = page.getByRole("searchbox", { name: "Find a component" });
    const resultCount = page.locator("search p[aria-hidden='true']");
    await search.fill("microphone");

    await expect(resultCount).toContainText(/1\s*of \d+ components/);
    await expect(
      page.getByRole("link", { name: /Sound Input SoundInput/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Clear component search" }),
    ).toBeVisible();
  });
});
