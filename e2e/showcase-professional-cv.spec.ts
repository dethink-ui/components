import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

const surface = '[data-recipe-surface="professional-cv"]';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("dethink-theme", "light"),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test.describe("professional CV recipe", () => {
  test("testimonial cards support keyboard selection and mobile scrolling", async ({
    page,
  }) => {
    await page.goto("/recipes/professional-cv");
    const testimonials = page.getByRole("radiogroup", { name: "Testimonials" });
    await testimonials
      .getByRole("radio", { name: "Testimonial from Jamie Ellis" })
      .focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      testimonials.getByRole("radio", { name: "Testimonial from Maya Chen" }),
    ).toBeChecked();
    await page.setViewportSize({ width: 390, height: 844 });
    const viewport = testimonials.locator(
      '[data-slot="card-scroller-viewport"]',
    );
    await testimonials
      .getByRole("radio", { name: "Testimonial from Jamie Ellis" })
      .check({ force: true });
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollLeft))
      .toBeLessThan(5);
    await page.getByRole("button", { name: "Next testimonial" }).click();
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(100);
    await page.getByRole("button", { name: "Previous testimonial" }).click();
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollLeft))
      .toBeLessThan(5);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
  test("shows the profile and navigates to career experience", async ({
    page,
  }) => {
    await page.goto("/recipes/professional-cv");
    await expect(
      page.getByRole("heading", { name: "Thoughtful design. Human impact." }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Portfolio navigation" })
      .getByRole("link", { name: "Experience" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Experience, earned." }),
    ).toBeInViewport();
    await expect(
      page.getByRole("heading", {
        name: "Senior designer · Chapter",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("gallery discovers the recipe and exposes its source and thumbnail", async ({
    page,
    request,
  }) => {
    await page.goto("/recipes");
    await page
      .getByRole("searchbox", { name: "Search recipes" })
      .fill("professional CV");
    await page
      .getByRole("list", { name: "Recipe results" })
      .getByRole("link", { name: "Alex Morgan professional CV" })
      .click();
    await expect(page.locator(surface)).toBeVisible();
    await expect(page.locator("pre")).toContainText(
      "export function ProfessionalCvRecipe",
    );
    const response = await request.get(
      "/recipe-captures/professional-cv--teal-light-default@1x.png",
    );
    expect(response.ok()).toBe(true);
    const image = await response.body();
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(675);
  });

  test("filters work and restores focus after keyboard case-study dismissal", async ({
    page,
  }) => {
    await page.goto("/recipes/professional-cv");
    const filter = page.getByRole("group", { name: "Filter projects" });
    await filter.getByRole("button", { name: "Digital", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "View Still case study" }),
    ).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText("1 project shown");
    const fieldnotes = page.getByRole("button", {
      name: "View Fieldnotes case study",
    });
    await fieldnotes.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", {
      name: "Fieldnotes — case study",
    });
    await expect(
      dialog.getByRole("heading", { name: "The approach" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(fieldnotes).toBeFocused();
    await filter.getByRole("button", { name: "Brand", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "View Fieldnotes case study" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "View Still case study" }).click();
    await expect(
      page.getByRole("dialog", { name: "Still — case study" }),
    ).toContainText("Visual identity");
    await page.getByRole("button", { name: "Back to selected work" }).click();
    await filter.getByRole("button", { name: "All work" }).click();
    await expect(
      page.getByRole("button", { name: /View .+ case study/ }),
    ).toHaveCount(2);
  });

  test("validates a local enquiry, announces completion and clears it on close", async ({
    page,
  }) => {
    const posts: string[] = [];
    await page.goto("/recipes/professional-cv");
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    const trigger = page.getByRole("button", { name: "Let’s talk" });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    const submit = dialog.getByRole("button", {
      name: "Prepare sample enquiry",
    });
    await submit.click();
    await expect(
      dialog.getByRole("textbox", { name: "Your name" }),
    ).toBeFocused();
    await expect(dialog.getByText("Please enter your name.")).toBeVisible();
    await dialog.getByRole("textbox", { name: "Your name" }).fill("Taylor");
    await dialog
      .getByRole("textbox", { name: "Email address" })
      .fill("bad-email");
    await submit.click();
    await expect(
      dialog.getByRole("textbox", { name: "Email address" }),
    ).toBeFocused();
    await dialog
      .getByRole("textbox", { name: "Email address" })
      .fill("taylor@example.com");
    await dialog
      .getByRole("textbox", { name: "A little about your idea" })
      .fill("Design a more welcoming product onboarding experience.");
    await submit.click();
    await expect(
      dialog.getByRole("heading", {
        name: "Your sample enquiry is ready, Taylor.",
      }),
    ).toBeFocused();
    await expect(dialog.getByRole("status")).toContainText("Nothing was sent.");
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(
      dialog.getByRole("textbox", { name: "Your name" }),
    ).toHaveValue("");
    expect(posts).toEqual([]);
  });

  test("downloads the sample CV and opens process disclosures", async ({
    page,
  }) => {
    await page.goto("/recipes/professional-cv");
    const downloading = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download CV · TXT" }).click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe("alex-morgan-cv.txt");
    const path = await download.path();
    expect(await readFile(path!, "utf8")).toContain("FICTIONAL SAMPLE CV");
    const explore = page.getByRole("button", { name: /Make space to explore/ });
    await explore.focus();
    await page.keyboard.press("Enter");
    await expect(explore).toHaveAttribute("aria-expanded", "true");
    await expect(
      page
        .locator(surface)
        .getByText("I turn promising directions into tangible prototypes.", {
          exact: false,
        }),
    ).toBeVisible();
  });

  test("reacts to system reduced motion and the page pause control", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/recipes/professional-cv");
    await expect(page.locator(surface)).toHaveAttribute(
      "data-motion",
      "paused",
    );
    await expect(
      page.getByRole("button", {
        name: "Motion disabled by system preference",
      }),
    ).toBeDisabled();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.getByRole("button", { name: "Pause page motion" }).click();
    await expect(page.locator(surface)).toHaveAttribute(
      "data-motion",
      "paused",
    );
    await page.getByRole("button", { name: "Enable page motion" }).click();
    await expect(page.locator(surface)).toHaveAttribute(
      "data-motion",
      "enabled",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(surface)).toHaveAttribute(
      "data-motion",
      "paused",
    );
    expect(errors).toEqual([]);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme fits desktop and mobile and passes accessibility checks`, async ({
      page,
    }) => {
      await page.goto("/recipes/professional-cv");
      await page
        .getByRole("button", {
          name: `${theme === "light" ? "Light" : "Dark"} theme`,
          exact: true,
        })
        .click();
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect(page.locator(surface)).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await expect(
          page.getByRole("button", { name: "Let’s talk" }),
        ).toBeVisible();
        await page.screenshot({
          path: `test-results/cv/${theme}-${width}.png`,
          fullPage: true,
        });
      }
      const results = await new AxeBuilder({ page })
        .include(surface)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      await page.getByRole("button", { name: "Let’s talk" }).click();
      const dialogResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(dialogResults.violations).toEqual([]);
    });
  }
});
