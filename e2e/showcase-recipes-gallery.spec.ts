import { expect, test } from "@playwright/test";
import { componentCatalog } from "../apps/showcase/src/lib/components-meta";
import {
  featuredRecipes,
  recipeCategories,
  recipesCatalog,
} from "../apps/showcase/src/lib/recipes-meta";

const recipeSlugs = recipesCatalog.map((recipe) => recipe.slug);
const recipeCount = recipesCatalog.length;
const billingCount = recipesCatalog.filter(
  (recipe) => recipe.category === "billing",
).length;
const aiCount = recipesCatalog.filter(
  (recipe) => recipe.category === "ai",
).length;

test.describe("showcase recipe discovery", () => {
  test("uses canonical total and featured recipe counts", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByText(
        `Open code · ${componentCatalog.length} components · ${recipeCount} recipes`,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(`${featuredRecipes.length} featured recipes`),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: `All ${recipeCount} recipes` }),
    ).toBeVisible();

    await page.goto("/recipes");
    await expect(
      page
        .getByText("Total recipes")
        .locator("..")
        .getByText(String(recipeCount), {
          exact: true,
        }),
    ).toBeVisible();
    await expect(
      page
        .getByText("Featured recipes")
        .locator("..")
        .getByText(String(featuredRecipes.length), {
          exact: true,
        }),
    ).toBeVisible();
    await expect(
      page
        .getByText("Categories")
        .locator("..")
        .getByText(String(recipeCategories.length), {
          exact: true,
        }),
    ).toBeVisible();
  });

  test("places recipe filters within the first desktop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recipes");

    const search = page.getByRole("searchbox", { name: "Search recipes" });
    const searchBounds = await search.boundingBox();

    expect(searchBounds).not.toBeNull();
    expect(searchBounds!.y + searchBounds!.height).toBeLessThan(900);
    await expect(page.getByRole("button", { name: "Billing" })).toBeVisible();
  });

  test("filters recipes and recovers from an empty state", async ({ page }) => {
    await page.goto("/recipes");

    const results = page.getByRole("list", { name: "Recipe results" });
    const resultCount = page.locator(
      'section[aria-labelledby="recipes-gallery-heading"] p[aria-hidden="true"]',
    );

    await expect(results.locator(":scope > li")).toHaveCount(recipeCount);
    await page.getByRole("button", { name: "Billing" }).click();
    await expect(page.getByRole("button", { name: "Billing" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(results.locator(":scope > li")).toHaveCount(billingCount);
    await expect(resultCount).toContainText(
      new RegExp(`Showing\\s*${billingCount}\\s*of ${recipeCount} recipes`),
    );

    await page
      .getByRole("searchbox", { name: "Search recipes" })
      .fill("not-a-real-recipe");
    await expect(
      page.getByRole("heading", { name: "No recipes found" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).last().click();
    await expect(results.locator(":scope > li")).toHaveCount(recipeCount);
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("keeps all recipe routes reachable from the gallery", async ({
    page,
  }) => {
    await page.goto("/recipes");

    const links = page
      .getByRole("list", { name: "Recipe results" })
      .getByRole("link");
    await expect(links).toHaveCount(recipeCount);

    const hrefs = await links.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    );
    expect(hrefs.sort()).toEqual(
      recipeSlugs.map((slug) => `/recipes/${slug}`).sort(),
    );

    await page
      .getByRole("list", { name: "Recipe results" })
      .locator('a[href="/recipes/login-and-onboarding"]')
      .click();
    await expect(page).toHaveURL(/\/recipes\/login-and-onboarding$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Onboarding workspace",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("serves a maintained capture for every recipe", async ({
    page,
    request,
  }) => {
    await page.goto("/recipes");

    const images = page
      .getByRole("list", { name: "Recipe results" })
      .locator("img");
    await expect(images).toHaveCount(recipeSlugs.length);

    // Thumbnails are intentionally lazy. Scroll each into view before checking.
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (item: HTMLImageElement) => item.complete && item.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }

    for (const slug of recipeSlugs) {
      const response = await request.get(
        `/recipe-captures/${slug}--teal-light-default@1x.png`,
      );
      expect(response.ok(), `${slug} capture should be available`).toBe(true);
    }
  });

  test("keeps 16:9 top-aligned captures stable across themes and widths", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recipes");

    const firstImage = page
      .getByRole("list", { name: "Recipe results" })
      .locator("img")
      .first();
    const firstFrame = firstImage.locator("..");
    const desktopBounds = await firstFrame.boundingBox();

    expect(desktopBounds).not.toBeNull();
    expect(desktopBounds!.width / desktopBounds!.height).toBeCloseTo(16 / 9, 1);
    await expect(firstImage).toHaveAttribute("width", "1200");
    await expect(firstImage).toHaveAttribute("height", "675");
    await expect(firstImage).toHaveAttribute("alt", "");
    await expect(firstImage).toHaveCSS("object-fit", "cover");
    await expect(firstImage).toHaveCSS("object-position", "50% 0%");

    await page.getByRole("button", { name: "Dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(firstImage).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileBounds = await firstFrame.boundingBox();
    expect(mobileBounds).not.toBeNull();
    expect(mobileBounds!.width / mobileBounds!.height).toBeCloseTo(16 / 9, 1);
    await expect(firstImage).toBeVisible();
  });

  test("filters on mobile without spatial motion when reduced", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/recipes");

    await expect(
      page.getByRole("searchbox", { name: "Search recipes" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "AI", exact: true }).click();

    const results = page.getByRole("list", { name: "Recipe results" });
    await expect(results.locator(":scope > li")).toHaveCount(aiCount);
    await expect(results.locator(":scope > li").first()).toHaveCSS(
      "transform",
      "none",
    );
  });
});
