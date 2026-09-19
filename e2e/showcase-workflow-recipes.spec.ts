import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const workflowSlugs = [
  "release-readiness",
  "integrations-hub",
  "invoice-approval-desk",
];

test("release checks gate approval and preserve the sign-off in activity", async ({
  page,
}) => {
  await page.goto("/recipes/release-readiness");
  const review = page.getByRole("button", {
    name: "Review release",
    exact: true,
  });
  await expect(review).toBeDisabled();
  const keyboardCheck = page.getByRole("checkbox", {
    name: "Keyboard and screen-reader review",
  });
  await keyboardCheck.focus();
  await page.keyboard.press("Space");
  await expect(keyboardCheck).toBeChecked();
  await expect(review).toBeDisabled();
  await page.getByRole("checkbox", { name: "Release notes are ready" }).check();
  await expect(
    page.getByRole("progressbar", { name: "Release readiness" }),
  ).toHaveAttribute("aria-valuenow", "6");
  await review.click();
  const dialog = page.getByRole("dialog", { name: "Approve v2.8" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(review).toBeFocused();
  await review.click();
  await dialog
    .getByRole("textbox", { name: "Approval note (optional)" })
    .fill("All owners signed off. Ready for the Friday window.");
  await dialog
    .getByRole("button", { name: "Approve release", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Release approved" }),
  ).toBeDisabled();
  await page.getByRole("tab", { name: "Activity", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "All owners signed off. Ready for the Friday window.",
  );
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(review).toBeDisabled();
  await expect(keyboardCheck).not.toBeChecked();
});

test("integrations connect, retain settings, and recover from empty search", async ({
  page,
}) => {
  await page.goto("/recipes/integrations-hub");
  const search = page.getByRole("textbox", { name: "Search integrations" });
  await search.fill("not-a-service");
  await expect(
    page
      .locator('[data-recipe-surface="integrations-hub"]')
      .getByText("No integrations found", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page
    .getByRole("button", { name: "Connect Atlas", exact: true })
    .click();
  const drawer = page.getByRole("dialog", { name: "Connect Atlas" });
  await drawer
    .getByRole("textbox", { name: "Workspace name" })
    .fill("Editorial team");
  await drawer
    .getByRole("button", { name: "Connect integration", exact: true })
    .click();
  await expect(
    drawer.getByRole("button", { name: "Saving…", exact: true }),
  ).toBeDisabled();
  await expect(drawer).toBeHidden();
  await expect(
    page.getByText("4 connected tools", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Connected (4)" }).click();
  await page.getByRole("button", { name: "Manage Atlas", exact: true }).click();
  const manage = page.getByRole("dialog", { name: "Manage Atlas" });
  await expect(
    manage.getByRole("textbox", { name: "Workspace name" }),
  ).toHaveValue("Editorial team");
  await manage.getByRole("switch", { name: "Automatic sync" }).uncheck();
  await manage
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(manage).toBeHidden();
  await page.getByRole("button", { name: "Manage Atlas", exact: true }).click();
  await expect(
    manage.getByRole("switch", { name: "Automatic sync" }),
  ).not.toBeChecked();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Manage Atlas", exact: true }),
  ).toBeFocused();
});

test("closing a pending integration save cancels the local connection", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/recipes/integrations-hub");
  await page
    .getByRole("button", { name: "Connect Pulse", exact: true })
    .click();
  const drawer = page.getByRole("dialog", { name: "Connect Pulse" });
  await drawer
    .getByRole("button", { name: "Connect integration", exact: true })
    .click();
  await drawer.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.clock.fastForward(1_000);
  await expect(drawer).toBeHidden();
  await expect(
    page.getByText("3 connected tools", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Connect Pulse", exact: true }),
  ).toBeVisible();
});

test("invoice decisions update totals and require a meaningful correction note", async ({
  page,
}) => {
  await page.goto("/recipes/invoice-approval-desk");
  await page
    .getByRole("button", { name: "Approve invoice", exact: true })
    .click();
  const approval = page.getByRole("dialog", {
    name: "Approve invoice",
    exact: true,
  });
  await approval
    .getByRole("textbox", { name: "Review note (optional)" })
    .fill("Matches the agreed design retainer.");
  await approval
    .getByRole("button", { name: "Confirm approval", exact: true })
    .click();
  await expect(approval).toBeHidden();
  await expect(
    page.getByText("Matches the agreed design retainer.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("£3,384.00", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Northline Cloud INV-1041/ }).click();
  await page
    .getByRole("button", { name: "Request changes", exact: true })
    .click();
  const correction = page.getByRole("dialog", {
    name: "Request changes",
    exact: true,
  });
  await correction
    .getByRole("textbox", { name: "What needs to change?" })
    .fill("   ");
  await correction
    .getByRole("button", { name: "Record changes request" })
    .click();
  await expect(correction.getByRole("alert")).toContainText(
    "Add a short explanation",
  );
  await correction
    .getByRole("textbox", { name: "What needs to change?" })
    .fill("Please update the purchase order reference.");
  await correction
    .getByRole("button", { name: "Record changes request" })
    .click();
  await expect(correction).toBeHidden();
  await expect(
    page.getByText("Please update the purchase order reference.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "INV-1041: Changes requested." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search invoices" })
    .fill("missing-vendor");
  await expect(
    page
      .locator('[data-recipe-surface="invoice-approval-desk"]')
      .getByText("No invoices found", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(
    page.getByRole("button", {
      name: /Northline Cloud INV-1041 Changes requested/,
    }),
  ).toBeVisible();
});

for (const theme of ["light", "dark"] as const) {
  test(`new workflows hydrate, reflow, and pass axe in ${theme} with reduced motion`, async ({
    page,
  }) => {
    test.slow();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat/i.test(message.text()))
        errors.push(message.text());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(
      (value) => localStorage.setItem("dethink-theme", value),
      theme,
    );
    for (const slug of workflowSlugs) {
      await page.goto(`/recipes/${slug}`);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const preview = page.locator(`[data-recipe-preview="${slug}"]`);
      await expect(preview).toBeVisible();
      await expect(
        preview.locator('[data-slot="avatar"]').first(),
      ).toHaveAttribute("data-reduced-motion", "true");
      await page.evaluate(async () => {
        await Promise.allSettled(
          document
            .getAnimations()
            .filter(
              (animation) =>
                animation.effect?.getTiming().iterations !== Infinity,
            )
            .map((animation) => animation.finished),
        );
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${slug} overflow`,
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .include(`[data-recipe-preview="${slug}"]`)
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map(({ id, nodes }) => ({
          id,
          nodes: nodes.map(({ target }) => target),
        })),
        slug,
      ).toEqual([]);
      await expect(
        page.locator('section[aria-labelledby="recipe-source-heading"]'),
      ).toContainText("use client");
    }
    expect(errors).toEqual([]);
  });
}
