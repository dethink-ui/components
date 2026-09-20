import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/date-time-picker");
});

test("choose a date and time together, edit minutes, and finish", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const basic = page.getByRole("region", { name: "Basic", exact: true });
  const trigger = basic.getByRole("button", { name: /Open calendar/ });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .locator('[data-slot="date-time-picker-calendar-cell"]')
    .filter({ hasText: /^16$/ })
    .click();
  await expect(dialog).toBeVisible();
  const exact = dialog.getByRole("group", { name: "Exact time", exact: true });
  await exact.getByRole("spinbutton", { name: /hour/ }).pressSequentially("14");
  await exact
    .getByRole("spinbutton", { name: /minute/ })
    .pressSequentially("17");
  await expect(basic.locator('input[name="kickoffAt"]')).toHaveValue(
    "2026-07-16T14:17:00",
  );
  await dialog.getByRole("button", { name: "14:30", exact: true }).click();
  await expect(basic.locator('input[name="kickoffAt"]')).toHaveValue(
    "2026-07-16T14:30:00",
  );
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await page.locator('[data-slot="date-time-picker-popover"]').screenshot({
    path: `test-results/${info.project.name}-date-time-picker.png`,
  });
  await dialog.getByRole("button", { name: "Done", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test("clock shortcut, keyboard focus, boundaries, and accessibility", async ({
  page,
}) => {
  // Audit settled semantic colors, rather than an intermediate entrance frame.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const basic = page.getByRole("region", { name: "Basic", exact: true });
  const clock = basic.getByRole("button", { name: "Open time picker" });
  await clock.click();
  await expect(
    page
      .getByRole("group", { name: "Exact time", exact: true })
      .getByRole("spinbutton", { name: /hour/ }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(clock).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const constrained = page.getByRole("region", {
    name: "Time selector",
    exact: true,
  });
  await constrained.getByRole("button", { name: "Open time picker" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "07:45", exact: true }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("button", { name: "08:00", exact: true }),
  ).toBeEnabled();
  await expect(
    dialog.getByRole("button", { name: "18:00", exact: true }),
  ).toBeEnabled();
  await expect(
    dialog.getByRole("button", { name: "18:15", exact: true }),
  ).toBeDisabled();
  const results = await new AxeBuilder({ page })
    .include('[data-slot="date-time-picker-popover"]')
    .analyze();
  expect(results.violations).toEqual([]);
});

test("seconds and empty-date guidance", async ({ page }) => {
  const seconds = page.getByRole("group", {
    name: "Second precision, 24h",
    exact: true,
  });
  await seconds.getByRole("button", { name: "Open time picker" }).click();
  await page
    .getByRole("group", { name: "Exact time", exact: true })
    .getByRole("spinbutton", { name: /second/ })
    .pressSequentially("42");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    seconds.getByRole("spinbutton", { name: /second/ }),
  ).toHaveAttribute("aria-valuenow", "42");
  const empty = page.getByRole("region", { name: "Presets", exact: true });
  await empty.getByRole("button", { name: "Open time picker" }).click();
  await expect(
    page.getByText("Choose a date first.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Exact time", exact: true }),
  ).toHaveAttribute("data-disabled", "true");
});

test("12-hour period controls work in dark mode with reduced motion", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  const field = page.getByRole("group", { name: "12-hour time", exact: true });
  await field.getByRole("button", { name: "Open time picker" }).click();
  const dialog = page.getByRole("dialog");
  const time = dialog.getByRole("group", { name: "Exact time", exact: true });
  await expect(time.getByRole("spinbutton", { name: /am\/pm/i })).toContainText(
    /pm/i,
  );
  await time.getByRole("spinbutton", { name: /am\/pm/i }).press("ArrowUp");
  await expect(time.getByRole("spinbutton", { name: /am\/pm/i })).toContainText(
    /am/i,
  );
  await dialog.getByRole("button", { name: "9:00 PM", exact: true }).click();
  await expect(time.getByRole("spinbutton", { name: /am\/pm/i })).toContainText(
    /pm/i,
  );
  const results = await new AxeBuilder({ page })
    .include('[data-slot="date-time-picker-popover"]')
    .analyze();
  expect(results.violations).toEqual([]);
  await page.locator('[data-slot="date-time-picker-popover"]').screenshot({
    path: `test-results/${info.project.name}-date-time-picker-dark.png`,
  });
});
