import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { recipesCatalog } from "../apps/showcase/src/lib/recipes-meta";

test.describe("showcase final journey", () => {
  test("finds, assesses, copies, and continues through components and recipes", async ({
    context,
    page,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:3015",
    });

    await page.goto("/components");
    await page
      .getByRole("searchbox", { name: "Find a component" })
      .fill("Button");
    await page.getByRole("link", { name: "Button", exact: true }).click();
    await expect(page).toHaveURL(/\/components\/button$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Button" }),
    ).toBeVisible();

    const sourceDisclosure = page.locator("#variants-source");
    const source = sourceDisclosure.locator(":scope > summary");
    await expect(source).toHaveAttribute(
      "aria-label",
      "Show source for Variants",
    );
    await expect(source).toBeVisible();
    await source.click();
    await expect(source).toHaveAttribute(
      "aria-label",
      "Hide source for Variants",
    );
    await expect(sourceDisclosure).toHaveAttribute("open", "");
    await expect(page.locator("#variants-source-content")).toContainText(
      "examples/button/variants.tsx",
    );

    const installation = page
      .locator("section")
      .filter({ has: page.locator("#installation-heading") });
    await installation.scrollIntoViewIfNeeded();
    await installation.getByRole("link", { name: "setup guide" }).click();
    const installCopy = page
      .locator("section")
      .filter({ has: page.locator("#registry-heading") })
      .getByRole("button", { name: "Copy code" })
      .first();
    await installCopy.click();
    await expect(
      page.getByRole("button", { name: "Copied" }).first(),
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(
        "npx shadcn@latest add https://components.dethink.co.uk/r/button.json",
      );

    await page.goto("/components/button");

    await page
      .getByRole("navigation", { name: "Components", exact: true })
      .getByRole("link", { name: "Icon Button", exact: true })
      .click();
    await expect(page).toHaveURL(/\/components\/icon-button$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "IconButton" }),
    ).toBeVisible();

    await page.goto("/recipes");
    await page.getByRole("button", { name: "AI", exact: true }).click();
    const recipes = page.getByRole("list", { name: "Recipe results" });
    await expect(recipes.locator(":scope > li")).toHaveCount(
      recipesCatalog.filter((recipe) => recipe.category === "ai").length,
    );
    await recipes.getByRole("link", { name: "AI workspace" }).click();
    await expect(page).toHaveURL(/\/recipes\/ai-workspace$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "AI workspace" }),
    ).toBeVisible();
    await expect(
      page.locator('[data-recipe-preview="ai-workspace"]'),
    ).toBeVisible();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`has no axe A/AA violations on changed ${theme} surfaces`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((theme) => {
        localStorage.setItem("dethink-theme", theme);
      }, theme);

      for (const route of [
        "/",
        "/components",
        "/components/button",
        "/recipes",
      ]) {
        await page.goto(route);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await page.waitForTimeout(100);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const summary = results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => node.target),
        }));

        expect(summary, `${theme} ${route} axe violations`).toEqual([]);
      }
    });
  }
});
