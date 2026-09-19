import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const surface = '[data-recipe-surface="relay-landing"]';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("dethink-theme", "light"),
  );
});

test("Relay is discoverable and exposes its live recipe and source", async ({
  page,
  request,
}) => {
  await page.goto("/recipes");
  await page.getByRole("searchbox", { name: "Search recipes" }).fill("Relay");
  const results = page.getByRole("list", { name: "Recipe results" });
  await expect(results.locator(":scope > li")).toHaveCount(1);
  await results
    .getByRole("link", { name: "Relay AI research landing" })
    .click();
  await expect(page).toHaveURL(/\/recipes\/relay-landing$/);
  await expect(
    page.locator(surface).getByRole("heading", { level: 1 }),
  ).toContainText("From scattered sources.");
  await page.getByRole("link", { name: "Source", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Source", exact: true }),
  ).toBeVisible();
  await expect(page.locator("pre")).toContainText(
    "export function RelayLandingRecipe",
  );
  const thumbnail = await request.get(
    "/recipe-captures/relay-landing--teal-light-default@1x.png",
  );
  expect(thumbnail.ok()).toBe(true);
  const image = await thumbnail.body();
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(675);
  await page
    .getByRole("navigation", { name: "Recipe demo controls" })
    .getByRole("link", { name: "Recipes", exact: true })
    .click();
  await expect(page).toHaveURL(/\/recipes$/);
});

test("Relay hydrates without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/recipes/relay-landing", { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: "Market signals" }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Make the reasoning visible.",
  );
  expect(errors).toEqual([]);
});

test("topics keep questions, findings and sources consistent", async ({
  page,
}) => {
  await page.goto("/recipes/relay-landing");
  const first = page.getByRole("tab", { name: "Customer feedback" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Market signals" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Make the reasoning visible.",
  );
  await page
    .getByRole("button", { name: "View source 2: Buyer interviews" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Buyer interviews" });
  await expect(dialog).toContainText(
    "I need to show my team why we should trust it",
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "View source 2: Buyer interviews" }),
  ).toBeFocused();
  await page.getByRole("tab", { name: "Product decisions" }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Give the decision a shared home.",
  );
  await page.getByRole("button", { name: "Read Decision log" }).click();
  await expect(
    page.getByRole("dialog", { name: "Decision log" }),
  ).toContainText("Writing down what would change our minds");
  await page.getByRole("button", { name: "Back to research" }).click();
  await expect(
    page.getByRole("button", { name: "Read Decision log" }),
  ).toBeFocused();
});

test("source filtering recovers and resets without breaking citations", async ({
  page,
}) => {
  await page.goto("/recipes/relay-landing");
  const search = page.getByRole("searchbox", { name: "Search sources" });
  await search.fill("missing source");
  await expect(page.getByRole("tabpanel")).toContainText("No sources found.");
  await page
    .getByRole("button", { name: "View source 1: Interview notes" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Interview notes" }),
  ).toContainText("A guided walkthrough would have helped.");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("button", { name: /^Read / })).toHaveCount(3);
  await search.fill("interview");
  await expect(page.getByRole("button", { name: /^Read / })).toHaveCount(1);
  await page.getByRole("tab", { name: "Market signals" }).click();
  await expect(
    page.getByRole("searchbox", { name: "Search sources" }),
  ).toHaveValue("");
  await expect(page.getByRole("button", { name: /^Read / })).toHaveCount(3);
});

test("a guided sample validates input, confirms locally, and preserves only completed names", async ({
  page,
}) => {
  await page.goto("/recipes/relay-landing");
  const trigger = page
    .locator(surface)
    .getByRole("button", { name: "Try the workspace" })
    .first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Try the workspace" });
  await dialog.getByRole("textbox", { name: "Workspace name" }).fill("   ");
  await dialog.getByRole("button", { name: "Create sample workspace" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "at least two characters",
  );
  await dialog
    .getByRole("textbox", { name: "Workspace name" })
    .fill("Product discovery");
  await dialog.getByRole("button", { name: "Create sample workspace" }).click();
  await expect(dialog.getByRole("status")).toContainText(
    "Your sample workspace is ready.",
  );
  await expect(dialog).toContainText("This local demo resets on refresh.");
  await dialog.getByRole("button", { name: "Back to the workspace" }).click();
  await expect(trigger).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Product discovery", exact: true }),
  ).toBeVisible();
  await trigger.click();
  await expect(
    dialog.getByRole("textbox", { name: "Workspace name" }),
  ).toHaveValue("Product discovery");
  await dialog
    .getByRole("textbox", { name: "Workspace name" })
    .fill("Cancelled name");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Product discovery", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Research workspace", exact: true }),
  ).toBeVisible();
});

for (const width of [390, 768, 1440, 1920]) {
  test(`Relay reflows and remains operable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/recipes/relay-landing");
    await expect(
      page.locator(surface).getByRole("navigation", { name: "Relay" }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Explore a sample", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Research workspace", exact: true }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Product decisions" }).click();
    await expect(page.getByRole("tabpanel")).toContainText(
      "Give the decision a shared home.",
    );
    const sourceRows = page.getByRole("button", { name: /^Read / });
    expect(
      await sourceRows.evaluateAll((rows) =>
        rows.every((row) => row.scrollHeight <= row.clientHeight + 1),
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Read Team retrospective" }).click();
    await expect(
      page.getByRole("dialog", { name: "Team retrospective" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const bounds = await page.locator(surface).boundingBox();
    expect(bounds!.width).toBeLessThanOrEqual(1201);
  });
}

for (const mode of ["light", "dark"] as const) {
  test(`Relay and its evidence dialog pass axe in ${mode} mode`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 1440,
      height: 900,
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/recipes/relay-landing");
    await page
      .getByRole("button", {
        name: mode === "light" ? "Light theme" : "Dark theme",
        exact: true,
      })
      .click();
    if (mode === "dark")
      await page.setViewportSize({ width: 390, height: 900 });
    const result = await new AxeBuilder({ page })
      .include(surface)
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    await page
      .getByRole("button", { name: "View evidence", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Interview notes" }),
    ).toBeVisible();
    const dialogResult = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(dialogResult.violations).toEqual([]);
  });
}

test("forced colours and reduced motion retain selected state and the FAQ path", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/recipes/relay-landing");
  await page.getByRole("tab", { name: "Market signals" }).click();
  await expect(
    page.getByRole("tab", { name: "Market signals" }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("button", { name: "Is this a live AI workspace?" })
    .click();
  await expect(page.locator(surface)).toContainText(
    "Nothing is uploaded or sent",
  );
  await page
    .locator(surface)
    .getByRole("button", { name: "Try the workspace" })
    .last()
    .click();
  const dialog = page.getByRole("dialog", { name: "Try the workspace" });
  await expect(
    dialog.getByRole("textbox", { name: "Workspace name" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
