import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const search = (page: Page) =>
  decodeURIComponent(new URL(page.url()).search).replace(/\+/g, " ");

async function axe(page: Page, selector: string) {
  const results = await new AxeBuilder({ page })
    .include(selector)
    // The recipe frame's site chrome is covered by the showcase suites.
    .analyze();

  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    })),
  ).toEqual([]);
}

test.describe("issue tracker recipe", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recipes/issue-tracker");
    // Wait for hydration before clicking.
    await page.waitForLoadState("networkidle");
  });

  test("query, chips, views, URL and assistant edit one filter", async ({
    page,
  }) => {
    const surface = page.locator('[data-recipe-surface="issue-tracker"]');
    const query = page.getByRole("combobox", { name: "Issue query" });

    // The first click can land before hydration on a cold dev server:
    // retry until the page responds.
    await expect(async () => {
      await surface
        .getByRole("navigation", { name: "Issue views" })
        .getByRole("button", { name: "Bug triage" })
        .click();
      await expect(query).toHaveValue("labels:bug status:backlog,todo", {
        timeout: 1000,
      });
    }).toPass({ timeout: 20_000 });
    await expect.poll(() => search(page)).toContain("q=labels:bug");

    // Typed text becomes chips.
    await query.fill("labels:bug status:backlog,todo priority:urgent");
    await query.press("Enter");
    await expect(
      page.getByRole("group", { name: "Priority is Urgent" }),
    ).toBeVisible();
    await expect(
      surface
        .getByRole("navigation", { name: "Issue views" })
        .getByRole("button", { name: /Bug triage/ }),
    ).toContainText("edited");

    // A removed chip updates the text and the URL.
    await page
      .getByRole("button", { name: "Remove filter, Priority is Urgent" })
      .click();
    await expect(query).toHaveValue("labels:bug status:backlog,todo");

    // The assistant asks, proposes, and applies in one step.
    await page.getByRole("button", { name: "Ask in words" }).click();
    await page
      .getByRole("textbox", { name: "Describe the filter you want" })
      .fill("my urgent bugs");
    await page.getByRole("button", { name: "Propose" }).click();
    await page
      .getByRole("group", { name: "Whose issues?" })
      .getByRole("button", { name: "Lin" })
      .click();
    await page.getByRole("button", { name: /^Apply \d changes?$/ }).click();
    await expect(query).toHaveValue(/assignee:lin/);

    await page.reload();
    await expect(
      page.getByRole("combobox", { name: "Issue query" }),
    ).toHaveValue(/assignee:lin/);
  });

  test("passes scoped axe", async ({ page }) => {
    await page.getByRole("button", { name: "Ask in words" }).click();
    await axe(page, '[data-recipe-surface="issue-tracker"]');
  });
});

test.describe("logs dashboard recipe", () => {
  test("server facets, facet toggles, histogram and details", async ({
    page,
  }) => {
    await page.goto("/recipes/logs-dashboard?q=level:error&v=1");

    const surface = page.locator('[data-recipe-surface="logs-dashboard"]');
    const query = page.getByRole("combobox", { name: "Log query" });

    await expect(query).toHaveValue("level:error");
    await expect(surface.locator('[data-slot="logs-histogram"]')).toContainText(
      "errors",
    );

    // Facet sidebar toggles edit the same filter.
    await surface
      .getByRole("navigation", { name: "Log facets" })
      .getByRole("button", { name: /^checkout/ })
      .click();
    await expect(query).toHaveValue("level:error service:checkout");
    await expect.poll(() => search(page)).toContain("service:checkout");

    // Picker counts come from the server, into reserved space.
    await page.getByRole("button", { name: "Change value, Error" }).click();
    const list = page.getByRole("listbox", { name: "Level" });

    await expect(
      list.getByRole("option", { name: /matching/ }).first(),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await surface.getByRole("button", { name: /—/ }).first().click();
    await expect(surface.locator('[data-slot="log-details"]')).toBeVisible();
  });

  test("time range and saved views", async ({ page }) => {
    await page.goto("/recipes/logs-dashboard");

    const query = page.getByRole("combobox", { name: "Log query" });

    await page.getByRole("button", { name: "Last 24h" }).click();
    await expect(
      page.getByRole("button", { name: "Last 24h" }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.locator('[data-slot="saved-views-trigger"]').click();
    await page
      .getByRole("button", { name: "Apply view 5xx or timeouts" })
      .click();
    await expect(query).toHaveValue("status:>=500 OR timeout");
    // Stays after Next.js settles its router (no stale URL restore).
    await page.waitForTimeout(800);
    await expect(query).toHaveValue("status:>=500 OR timeout");
    await expect.poll(() => search(page)).toContain("status:>=500");
  });

  test("passes scoped axe", async ({ page }) => {
    await page.goto("/recipes/logs-dashboard?q=level:error&v=1");
    await expect(page.locator('[data-slot="logs-histogram"]')).toContainText(
      "errors",
    );
    await axe(page, '[data-recipe-surface="logs-dashboard"]');
  });
});

test.describe("server mode example", () => {
  test("keeps its layout while results and counts load", async ({ page }) => {
    await page.goto("/components/filter-bar");

    const table = page.getByRole("table", { name: "Orders" });

    await expect(table.getByRole("row").nth(1)).toBeVisible();

    // Position within the example itself: content elsewhere on the page
    // may still settle, but nothing inside the example should move.
    const box = () =>
      table.evaluate((node) => {
        const container = node.closest("[aria-busy]") as HTMLElement;
        const rect = node.getBoundingClientRect();

        return {
          offset: rect.top - container.getBoundingClientRect().top,
          height: rect.height,
        };
      });

    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await table.scrollIntoViewIfNeeded();

    const before = await box();

    await page
      .getByRole("button", { name: "Remove filter, Plan is Enterprise" })
      .click();
    // While the next page loads, the old rows stay: nothing moves.
    await expect(page.locator('[aria-busy="true"]').first()).toBeVisible();
    expect(await box()).toEqual(before);
    await expect(page.getByText(/240 orders on the server/)).toBeVisible();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("loading indicators don't animate", async ({ page }) => {
    await page.goto("/recipes/logs-dashboard?q=level:error&v=1");
    await page.waitForLoadState("networkidle");

    for (const selector of [
      '[data-slot="pending-line"]',
      '[data-slot="logs-histogram-bars"]',
    ]) {
      expect(
        await page
          .locator(selector)
          .first()
          .evaluate((node) => getComputedStyle(node).transitionDuration),
      ).toMatch(/^0s/);
    }

    // Facet count placeholders don't pulse. The time range is fresh, so
    // the picker's counts are still loading when it opens.
    await page.getByRole("button", { name: "Last 4h" }).click();
    await page.getByRole("button", { name: "Change value, Error" }).click();

    const placeholder = page
      .locator('[data-slot="filter-facet-count-loading"]')
      .first();

    await expect(placeholder).toBeAttached();
    expect(
      await page.evaluate(() => {
        const node = document.querySelector(
          '[data-slot="filter-facet-count-loading"]',
        );

        // Counts may arrive meanwhile; a missing node can't animate either.
        return node ? getComputedStyle(node).animationName : "none";
      }),
    ).toBe("none");
  });
});

test.describe("visual", () => {
  // Baselines are recorded on macOS; other platforms render text differently.
  test.skip(
    process.platform !== "darwin",
    "Visual baselines are recorded on macOS",
  );

  for (const slug of ["issue-tracker", "logs-dashboard"] as const) {
    test(`${slug} recipe`, async ({ page }) => {
      await page.goto(`/recipes/${slug}`);
      await page.waitForLoadState("networkidle");
      // Wait for the pretend server: rows shown and nothing pending.
      await expect(
        page.locator(`[data-recipe-surface="${slug}"] tbody tr`).first(),
      ).not.toHaveAttribute("data-table-slot", "loading-row");
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      await expect(
        page.locator(`[data-recipe-surface="${slug}"]`),
      ).toHaveScreenshot(`${slug}.png`);
    });
  }
});
