import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const route = "/recipes/maison-sillage";
const surface = '[data-recipe-surface="maison-sillage"]';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("dethink-theme", "light"),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function addProduct(page: Page, name = "Ambre 01", size = "50") {
  await page
    .getByRole("button", { name: `Discover ${name}`, exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name, exact: true });
  await dialog.getByRole("radio", { name: `${size} ml`, exact: true }).check();
  await dialog.getByRole("button", { name: /Add to bag/ }).click();
  await expect(dialog.getByRole("status")).toContainText(
    `Added ${name}, ${size} ml`,
  );
  await dialog.getByRole("button", { name: "Continue exploring" }).click();
}

test("gallery exposes storefront, source and correctly sized thumbnail", async ({
  page,
  request,
}) => {
  await page.goto("/recipes");
  await page
    .getByRole("searchbox", { name: "Search recipes" })
    .fill("Maison Sillage");
  await page
    .getByRole("list", { name: "Recipe results" })
    .getByRole("link", { name: "Maison Sillage perfume store" })
    .click();
  await expect(
    page
      .locator(surface)
      .getByRole("heading", { name: "Some things stay with you." }),
  ).toBeVisible();
  await expect(page.locator("pre")).toContainText(
    "export function MaisonSillageRecipe",
  );
  const response = await request.get(
    "/recipe-captures/maison-sillage--teal-light-default@1x.png",
  );
  expect(response.ok()).toBe(true);
  const bytes = await response.body();
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(675);
});

test("scent filters and keyboard size selection update the matching product price", async ({
  page,
}) => {
  await page.goto(route);
  const filter = page.getByRole("group", { name: "Scent family" });
  await filter.getByRole("button", { name: "Floral", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Discover / })).toHaveCount(1);
  const trigger = page.getByRole("button", { name: "Discover Rose 02" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Rose 02", exact: true });
  await expect(dialog).toContainText("Rose · Peony");
  await dialog.getByRole("radio", { name: "50 ml", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    dialog.getByRole("radio", { name: "100 ml", exact: true }),
  ).toBeChecked();
  await expect(
    dialog.getByRole("button", { name: "Add to bag — £185" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await filter.getByRole("button", { name: "All scents" }).click();
  await expect(page.getByRole("button", { name: /^Discover / })).toHaveCount(3);
});

test("bag merges matching variants, separates sizes and calculates totals", async ({
  page,
}) => {
  await page.goto(route);
  await addProduct(page);
  await addProduct(page);
  await addProduct(page, "Ambre 01", "30");
  await page
    .getByRole("button", { name: "Open shopping bag, 3 items" })
    .click();
  const bag = page.getByRole("dialog", { name: "Your bag", exact: true });
  await expect(
    bag.getByRole("list", { name: "Shopping bag items" }).getByRole("listitem"),
  ).toHaveCount(2);
  const quantity = bag.getByRole("spinbutton", {
    name: "Quantity for Ambre 01, 50 ml",
  });
  await expect(quantity).toHaveValue("2");
  await expect(bag.locator("[data-sillage-totals]")).toContainText("£285");
  await quantity.fill("3");
  await expect(bag.locator("[data-sillage-totals]")).toContainText("£395");
  await quantity.fill("20");
  await expect(quantity).toHaveValue("9");
  await quantity.fill("0");
  await expect(quantity).toHaveValue("1");
  await bag.getByRole("button", { name: "Remove Ambre 01, 30 ml" }).click();
  await expect(bag.locator("[data-sillage-totals]")).toContainText("£115");
  await expect(
    bag.getByRole("heading", { name: "1 item in your bag" }),
  ).toBeFocused();
  await bag.getByRole("button", { name: "Remove Ambre 01, 50 ml" }).click();
  await expect(
    bag.getByRole("heading", { name: "Your next signature is waiting." }),
  ).toBeFocused();
  await expect(
    bag.getByRole("button", { name: "Review sample order" }),
  ).toHaveCount(0);
  await bag.getByRole("button", { name: "Explore the collection" }).click();
  await expect(
    page.getByRole("button", { name: "Open shopping bag, 0 items" }),
  ).toBeFocused();
});

test("checkout reviews the bag, permits edits, and completes without requests", async ({
  page,
}) => {
  await page.goto(route);
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await addProduct(page, "Bois 03", "100");
  await page
    .getByRole("button", { name: "Open shopping bag, 1 items" })
    .click();
  const bag = page.getByRole("dialog", { name: "Your bag", exact: true });
  await bag.getByRole("button", { name: "Review sample order" }).click();
  await expect(
    bag.getByRole("heading", { name: "Review your sample order" }),
  ).toBeFocused();
  await expect(
    bag.getByRole("list", { name: "Order review items" }),
  ).toContainText("Bois 03");
  await bag.getByRole("button", { name: "Back to bag" }).click();
  await expect(
    bag.getByRole("spinbutton", { name: "Quantity for Bois 03, 100 ml" }),
  ).toHaveValue("1");
  await bag.getByRole("button", { name: "Review sample order" }).click();
  await bag.getByRole("button", { name: "Complete demo checkout" }).click();
  await expect(
    bag.getByRole("heading", { name: "Your demo checkout is complete." }),
  ).toBeFocused();
  await expect(bag).toContainText(
    "No order was placed and no payment was taken.",
  );
  await expect(bag).toContainText("£180");
  await bag.getByRole("button", { name: "Continue exploring" }).click();
  await expect(
    page.getByRole("button", { name: "Open shopping bag, 0 items" }),
  ).toBeFocused();
  expect(posts).toEqual([]);
});

test("reviews, FAQ and reactive motion preferences work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(route);
  const reviews = page.getByRole("radiogroup", { name: "Fragrance reviews" });
  await reviews.getByRole("radio", { name: "Review by Clara M." }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    reviews.getByRole("radio", { name: "Review by Jules R." }),
  ).toBeChecked();
  await page.getByRole("button", { name: "How does delivery work?" }).click();
  await expect(
    page
      .locator(surface)
      .getByText("The demo bag uses a £5 delivery charge", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(surface)).toHaveAttribute("data-motion", "paused");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Pause page motion" }).click();
  await expect(page.locator(surface)).toHaveAttribute("data-motion", "paused");
  await page.getByRole("button", { name: "Enable page motion" }).click();
  await expect(page.locator(surface)).toHaveAttribute("data-motion", "enabled");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Motion disabled by system preference" }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});

for (const theme of ["light", "dark"] as const)
  test(`${theme} storefront, product and bag are accessible on mobile`, async ({
    page,
  }) => {
    await page.goto(route);
    await page
      .getByRole("button", {
        name: theme === "light" ? "Light theme" : "Dark theme",
        exact: true,
      })
      .click();
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(
        page.getByRole("button", { name: "Open shopping bag, 0 items" }),
      ).toBeVisible();
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include(surface)
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.getByRole("button", { name: "Discover Ambre 01" }).click();
    expect(
      (
        await new AxeBuilder({ page })
          .include('[role="dialog"]')
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.getByRole("button", { name: /Add to bag/ }).click();
    await page.getByRole("button", { name: "Continue exploring" }).click();
    await page
      .getByRole("button", { name: "Open shopping bag, 1 items" })
      .click();
    expect(
      (
        await new AxeBuilder({ page })
          .include('[role="dialog"]')
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
