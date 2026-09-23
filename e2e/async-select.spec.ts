import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("async search, empty results, keyboard retry and recovery", async ({
  page,
}) => {
  await page.goto("/components/async-select");
  await expect(page.locator('[data-slot="async-select-demo"]')).toHaveAttribute(
    "data-ready",
    "true",
  );
  const field = page.getByRole("combobox", { name: "Account", exact: true });
  await field.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await field.fill("north");
  await expect(
    page.getByRole("option", { name: "Northstar Systems" }),
  ).toBeVisible();
  await field.fill("no-such-account");
  await expect(
    page.locator('[data-slot="combobox-popover"] [role="status"]'),
  ).toHaveText("No results found.");
  await field.press("Escape");
  await page.getByRole("button", { name: "Simulate connection error" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Could not load accounts" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Show options Account", exact: true })
    .click();
  await field.press("Tab");
  await expect(
    page.getByRole("button", { name: "Retry", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(field).toBeFocused();
  await field.fill("acme");
  await expect(
    page.getByRole("option", { name: "Acme Operations" }),
  ).toBeVisible();
  await field.press("ArrowDown");
  await field.press("Enter");
  await expect(field).toHaveValue("Acme Operations");
});

test("open async feedback remains accessible and contained on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/async-select");
  await page
    .getByRole("button", { name: "Show options Loading customer", exact: true })
    .click();
  const popup = page.locator('[data-slot="combobox-popover"]');
  await expect(popup.getByRole("status")).toHaveText("Finding customers...");
  expect(
    await popup
      .getByRole("status")
      .evaluate((el) => !!el.closest('[aria-hidden="true"]')),
  ).toBe(false);
  const rect = await popup.boundingBox();
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(390);
  const results = await new AxeBuilder({ page })
    .include('[data-slot="combobox-popover"]')
    .analyze();
  expect(results.violations).toEqual([]);
});
