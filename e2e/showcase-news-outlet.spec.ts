import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const surface = '[data-recipe-surface="news-outlet"]';
const lead = "A new chapter for the world’s coastal cities";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("dethink-theme", "light"),
  );
});

test("gallery discovers the recipe, its source and its generated thumbnail", async ({
  page,
  request,
}) => {
  await page.goto("/recipes");
  await page
    .getByRole("searchbox", { name: "Search recipes" })
    .fill("The Current");
  const results = page.getByRole("list", { name: "Recipe results" });
  await expect(results.locator(":scope > li")).toHaveCount(1);
  await results.getByRole("link", { name: "The Current news outlet" }).click();
  await expect(
    page.locator(surface).getByRole("heading", { level: 1 }),
  ).toHaveText(lead);
  await page.getByRole("link", { name: "Source", exact: true }).click();
  await expect(page.locator("pre")).toContainText(
    "export function NewsOutletRecipe",
  );
  const response = await request.get(
    "/recipe-captures/news-outlet--teal-light-default@1x.png",
  );
  expect(response.ok()).toBe(true);
  const image = await response.body();
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(675);
});

test("article previews restore focus and bookmarks synchronize across appearances", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/recipes/news-outlet");
  const story = page
    .locator(surface)
    .getByRole("heading", { level: 1 })
    .getByRole("button");
  await story.click();
  const dialog = page.getByRole("dialog", { name: lead, exact: true });
  await expect(dialog).toContainText("At the edge of the city");
  await dialog
    .getByRole("button", { name: `Save ${lead}`, exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: `Unsave ${lead}`, exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(story).toBeFocused();
  await expect(
    page
      .locator(surface)
      .getByRole("button", { name: `Unsave ${lead}`, exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Saved stories (1)", exact: true })
    .click();
  const saved = page.getByRole("dialog", { name: "Your saved stories" });
  await saved.getByRole("button", { name: `Remove ${lead}` }).click();
  await expect(saved).toContainText("Make room for a good read");
  await expect(
    saved.getByRole("heading", { name: "Your saved stories" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Saved stories (0)", exact: true }),
  ).toBeFocused();
  expect(errors).toEqual([]);
});

test("search finds local reporting, handles empty results and preserves nested-dialog focus", async ({
  page,
}) => {
  await page.goto("/recipes/news-outlet");
  await page
    .getByRole("button", { name: "Search stories", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Search The Current" });
  const input = dialog.getByRole("searchbox", { name: "Search stories" });
  await input.fill("rail");
  const result = dialog.getByRole("button", {
    name: "The new rail routes reshaping a connected world",
    exact: true,
  });
  await expect(dialog.getByRole("status")).toHaveText("1 story found");
  await result.click();
  await expect(
    page.getByRole("dialog", {
      name: "The new rail routes reshaping a connected world",
      exact: true,
    }),
  ).toContainText("The journey starts before the destination");
  await page.keyboard.press("Escape");
  await expect(result).toBeFocused();
  await input.fill("zzzz-no-story");
  await expect(dialog).toContainText("No matching stories");
  await dialog.getByRole("button", { name: "Clear search" }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  await expect(
    dialog.getByRole("list", { name: "Search results" }).getByRole("listitem"),
  ).toHaveCount(12);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Search stories", exact: true }),
  ).toBeFocused();
});

test("news tabs work with arrow keys and Watch exposes honest transcript previews", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/recipes/news-outlet");
  await page.getByRole("tab", { name: "Latest", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Most read" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tabpanel")).toContainText(lead);
  const video = page.getByRole("button", {
    name: "Preview The ocean’s quiet comeback",
  });
  const previewBounds = await video.boundingBox();
  expect(previewBounds).not.toBeNull();
  expect(previewBounds!.height / previewBounds!.width).toBeCloseTo(9 / 16, 1);
  await video.click();
  const dialog = page.getByRole("dialog", {
    name: "The ocean’s quiet comeback",
    exact: true,
  });
  await expect(dialog).toContainText("Video playback is not included");
  await expect(dialog).toContainText("Sample transcript");
  await dialog.getByRole("button", { name: "Back to Watch" }).click();
  await expect(video).toBeFocused();
});

test("newsletter validates and confirms without sending or persisting the email", async ({
  page,
}) => {
  await page.goto("/recipes/news-outlet");
  const sent: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") sent.push(request.url());
  });
  const section = page.getByRole("region", { name: "The Current newsletter" });
  const input = section.getByRole("textbox", { name: "Email address" });
  await input.fill("invalid");
  await section.getByRole("button", { name: "Sign me up" }).click();
  await expect(section.getByRole("alert")).toContainText("Enter a valid email");
  await expect(input).toBeFocused();
  await input.fill("reader@example.com");
  await section.getByRole("button", { name: "Sign me up" }).click();
  await expect(section.getByRole("status")).toContainText(
    "You’re on the sample list",
  );
  expect(sent).toEqual([]);
  await page.reload();
  await expect(input).toHaveValue("");
  await expect(section.getByRole("status")).toContainText("Demo signup");
});

for (const width of [390, 768, 1440]) {
  test(`news layout and section navigation remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/recipes/news-outlet");
    const content = page.locator(surface);
    await expect(content.getByRole("heading", { level: 1 })).toBeVisible();
    const navigation = content.getByRole("navigation", {
      name: width < 1024 ? "Mobile news sections" : "News sections",
      exact: true,
    });
    for (const topic of [
      "World",
      "Politics",
      "Business",
      "Science",
      "Culture",
      "Sport",
    ]) {
      await navigation.getByRole("link", { name: topic, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${topic.toLowerCase()}$`));
    }
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport + 1);
    await content.locator("footer").scrollIntoViewIfNeeded();
    const images = content.locator("img");
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (element: HTMLImageElement) =>
              element.complete && element.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`${theme} theme passes accessibility scans, including reader dialogs`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("dethink-theme", value),
      theme,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/recipes/news-outlet");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const result = await new AxeBuilder({ page })
      .include(surface)
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    await page
      .getByRole("button", { name: "Search stories", exact: true })
      .click();
    const overlay = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(overlay.violations).toEqual([]);
  });
}
