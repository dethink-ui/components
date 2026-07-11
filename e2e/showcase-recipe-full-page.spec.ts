import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const recipePath = "/recipes/command-center-dashboard";
const recipeSlugs = [
  "login-and-onboarding",
  "saas-landing-page",
  "dethink-labs-security",
  "command-center-dashboard",
  "crud-resource-manager",
  "settings-and-billing",
  "ai-workspace",
  "customer-support-copilot",
  "scheduler-and-booking",
  "saas-checkout-order-summary",
];
const representativeRoutes = [
  {
    route: "/recipes/login-and-onboarding",
    slug: "login-and-onboarding",
  },
  { route: "/recipes/saas-landing-page", slug: "saas-landing-page" },
  {
    route: "/recipes/command-center-dashboard",
    slug: "command-center-dashboard",
  },
  { route: "/recipes/ai-workspace", slug: "ai-workspace" },
];

test.describe("showcase full-page recipe shell", () => {
  test("puts the representative product in the first desktop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(recipePath);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Command-center dashboard",
      }),
    ).toBeVisible();

    const preview = page.locator(
      '[data-recipe-preview="command-center-dashboard"]',
    );
    const layoutWidth = await page.evaluate(() => document.body.clientWidth);
    const previewBounds = await preview.boundingBox();
    const detailsBounds = await page
      .getByRole("heading", {
        level: 2,
        name: "Command-center dashboard",
      })
      .boundingBox();

    expect(previewBounds).not.toBeNull();
    expect(previewBounds!.x).toBeCloseTo((layoutWidth - 1200) / 2, 0);
    expect(previewBounds!.width).toBe(1200);
    expect(previewBounds!.y).toBeLessThanOrEqual(120);
    expect(previewBounds!.y + previewBounds!.height).toBeGreaterThanOrEqual(
      900,
    );
    expect(detailsBounds).not.toBeNull();
    expect(detailsBounds!.y).toBeGreaterThanOrEqual(900);
    await expect(
      page.locator('[data-recipe-surface="command-center-dashboard"]'),
    ).toHaveCSS("border-top-left-radius", "0px");
  });

  test("keeps demo navigation and source in natural keyboard order", async ({
    page,
  }) => {
    await page.goto(recipePath);

    const controls = page.getByRole("navigation", {
      name: "Recipe demo controls",
    });
    const back = controls.getByRole("link", { name: "Recipes" });
    const details = controls.getByRole("link", { name: "Details" });
    const source = controls.getByRole("link", { name: "Source" });

    await back.focus();
    await expect(back).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(details).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(source).toBeFocused();

    await source.click();
    await expect(page).toHaveURL(/#recipe-source-heading$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Source" }),
    ).toBeInViewport();

    await back.click();
    await expect(page).toHaveURL(/\/recipes$/);
  });

  test("fills mobile without document overflow or spatial bar motion", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(recipePath);

    const preview = page.locator(
      '[data-recipe-preview="command-center-dashboard"]',
    );
    const layoutWidth = await page.evaluate(() => document.body.clientWidth);
    const previewBounds = await preview.boundingBox();

    expect(previewBounds).not.toBeNull();
    expect(previewBounds!.x).toBe(0);
    expect(previewBounds!.width).toBe(layoutWidth);
    expect(previewBounds!.y).toBeLessThanOrEqual(120);
    expect(previewBounds!.y + previewBounds!.height).toBeGreaterThanOrEqual(
      844,
    );
    await expect(page.locator("[data-recipe-demo-bar]")).toHaveCSS(
      "transform",
      "none",
    );
    await expect(
      page.getByRole("button", { name: "Open sidebar" }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  });

  test("applies the full-page contract to every recipe", async ({ page }) => {
    test.slow();

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);

      for (const slug of recipeSlugs) {
        await page.goto(`/recipes/${slug}`);

        const preview = page.locator(`[data-recipe-preview="${slug}"]`);
        const surface = page.locator(`[data-recipe-surface="${slug}"]`);
        const previewBounds = await preview.boundingBox();
        const layoutWidth = await page.evaluate(
          () => document.body.clientWidth,
        );
        const expectedWidth = Math.min(layoutWidth, 1200);
        const expectedStart = (layoutWidth - expectedWidth) / 2;

        expect(previewBounds, `${slug} preview bounds`).not.toBeNull();
        expect(previewBounds!.x, `${slug} preview start`).toBeCloseTo(
          expectedStart,
          0,
        );
        expect(previewBounds!.width, `${slug} preview width`).toBe(
          expectedWidth,
        );
        expect(previewBounds!.y, `${slug} preview top`).toBeLessThanOrEqual(
          120,
        );
        expect(
          previewBounds!.y + previewBounds!.height,
          `${slug} preview first viewport`,
        ).toBeGreaterThanOrEqual(viewport.height);
        await expect(surface, `${slug} full-page surface`).toBeVisible();
        await expect
          .poll(
            () =>
              page.evaluate(
                () => document.documentElement.scrollWidth <= window.innerWidth,
              ),
            { message: `${slug} document overflow` },
          )
          .toBe(true);
      }
    }
  });

  for (const theme of ["light", "dark"] as const) {
    test(`has no axe A/AA violations on representative ${theme} demos`, async ({
      page,
    }) => {
      test.slow();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem("dethink-theme", selectedTheme);
      }, theme);

      for (const { route, slug } of representativeRoutes) {
        await page.goto(route);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await page.locator("html").evaluate(async () => {
          await Promise.allSettled(
            document
              .getAnimations({ subtree: true })
              .map((animation) => animation.finished),
          );
        });
        const results = await new AxeBuilder({ page })
          .include(`[data-recipe-preview="${slug}"]`)
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

  test("keeps the gallery, demo, details, source, and return journey intact", async ({
    page,
  }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/recipes");
      await page.getByRole("link", { name: "AI workspace" }).click();
      await expect(page).toHaveURL(/\/recipes\/ai-workspace$/);
      await expect(
        page.locator('[data-recipe-surface="ai-workspace"]'),
      ).toBeVisible();

      const controls = page.getByRole("navigation", {
        name: "Recipe demo controls",
      });
      await controls.getByRole("link", { name: "Details" }).click();
      await expect(
        page.getByRole("heading", { level: 2, name: "AI workspace" }),
      ).toBeInViewport();
      await controls.getByRole("link", { name: "Source" }).click();
      await expect(
        page.getByRole("heading", { level: 2, name: "Source" }),
      ).toBeInViewport();
      await controls.getByRole("link", { name: "Recipes" }).click();
      await expect(page).toHaveURL(/\/recipes$/);
    }
  });

  test("reflows the demo controls at a 200%-equivalent viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto(recipePath);

    const controls = page.getByRole("navigation", {
      name: "Recipe demo controls",
    });
    await expect(controls.getByRole("link", { name: "Recipes" })).toBeVisible();
    await expect(controls.getByRole("link", { name: "Details" })).toBeVisible();
    await expect(controls.getByRole("link", { name: "Source" })).toBeVisible();
    await expect(
      page.locator('[data-recipe-surface="command-center-dashboard"]'),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  });

  test("retains visible demo navigation focus in forced colors", async ({
    page,
  }) => {
    await page.emulateMedia({
      forcedColors: "active",
      reducedMotion: "reduce",
    });
    await page.goto(recipePath);

    const back = page
      .getByRole("navigation", { name: "Recipe demo controls" })
      .getByRole("link", { name: "Recipes" });
    await back.focus();
    await expect(back).toBeFocused();
    await expect(back).toHaveCSS("outline-style", "solid");
    await expect(back).toHaveCSS("outline-width", "2px");
  });

  test("keeps settings and billing spacing and plan state aligned", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/recipes/settings-and-billing");

    const workspacePanel = page.locator('[data-settings-panel="workspace"]');
    const planPanel = page.locator('[data-settings-panel="plan"]');
    const form = workspacePanel.locator('[data-slot="form"]');
    const title = page.getByRole("heading", {
      level: 2,
      name: "Northstar Operations",
    });
    const currentPlan = page.locator("[data-settings-current-plan]");
    const growth = page.getByRole("radio", { name: "Growth" });
    const starter = page.getByRole("radio", { name: "Starter" });

    const workspaceBounds = await workspacePanel.boundingBox();
    const planBounds = await planPanel.boundingBox();
    const formBounds = await form.boundingBox();
    const titleBounds = await title.boundingBox();
    const summaryBounds = await currentPlan.boundingBox();

    expect(workspaceBounds).not.toBeNull();
    expect(planBounds).not.toBeNull();
    expect(workspaceBounds!.y).toBeCloseTo(planBounds!.y, 0);
    expect(formBounds).not.toBeNull();
    expect(formBounds!.height).toBeLessThan(700);
    expect(titleBounds).not.toBeNull();
    expect(summaryBounds).not.toBeNull();
    expect(Math.abs(summaryBounds!.y - titleBounds!.y)).toBeLessThanOrEqual(2);

    await expect(growth).toBeChecked();
    await expect(currentPlan).toHaveText("Current plan · Growth");
    await starter.check();
    await expect(starter).toBeChecked();
    await expect(currentPlan).toHaveText("Current plan · Starter");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const surface = page.locator(
      '[data-recipe-surface="settings-and-billing"]',
    );
    const mobileSurfaceBounds = await surface.boundingBox();
    const mobileWorkspaceBounds = await workspacePanel.boundingBox();
    const mobilePlanBounds = await planPanel.boundingBox();
    const mobileTitleBounds = await title.boundingBox();
    const mobileSummaryBounds = await currentPlan.boundingBox();
    expect(mobileSurfaceBounds).not.toBeNull();
    expect(mobileWorkspaceBounds).not.toBeNull();
    expect(mobilePlanBounds).not.toBeNull();
    expect(
      mobileWorkspaceBounds!.x + mobileWorkspaceBounds!.width,
    ).toBeLessThanOrEqual(mobileSurfaceBounds!.x + mobileSurfaceBounds!.width);
    expect(mobilePlanBounds!.x + mobilePlanBounds!.width).toBeLessThanOrEqual(
      mobileSurfaceBounds!.x + mobileSurfaceBounds!.width,
    );
    expect(mobileTitleBounds).not.toBeNull();
    expect(mobileSummaryBounds).not.toBeNull();
    expect(mobileSummaryBounds!.y).toBeGreaterThan(
      mobileTitleBounds!.y + mobileTitleBounds!.height,
    );
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  });

  test("keeps Security proof text complete on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/recipes/dethink-labs-security");

    const surface = page.locator(
      '[data-recipe-surface="dethink-labs-security"]',
    );
    const status = page.locator("[data-security-status]");
    const proof = page.locator("[data-security-proof]");
    await expect(surface).toBeVisible();
    await expect(status).toBeVisible();
    const surfaceBounds = await surface.boundingBox();
    const statusBounds = await status.boundingBox();

    expect(surfaceBounds).not.toBeNull();
    expect(statusBounds).not.toBeNull();
    expect(statusBounds!.x + statusBounds!.width).toBeLessThanOrEqual(
      surfaceBounds!.x + surfaceBounds!.width,
    );
    await expect(status).toHaveText(
      "ALL SYSTEMS MONITORED · ZERO TRUST BY DEFAULT",
    );
    await expect
      .poll(() =>
        proof.evaluate((element) =>
          element.textContent
            ?.replace(/\s+/g, " ")
            .includes("deployment mean time to isolate"),
        ),
      )
      .toBe(true);
  });
});
