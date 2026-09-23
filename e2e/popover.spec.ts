import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/popover");
});

test("keyboard dismissal, focus restoration, and labelled content", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Share dashboard",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Share dashboard" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Done" })).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-slot="popover-content"]')
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(5, 200);
  await expect(dialog).toHaveCount(0);
});

test("inline edit validates, saves on Enter, and discards cancelled drafts", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: /Edit monthly spend limit/,
  });
  await trigger.click();
  const input = page.getByRole("spinbutton", { name: "Limit (USD)" });
  await input.fill("");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Enter an amount of 0 or more.", { exact: true }),
  ).toBeVisible();
  await input.fill("-1");
  await input.press("Enter");
  await expect(input).toBeVisible();
  await input.fill("750.50");
  await input.press("Enter");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toHaveAccessibleName(
    "Edit monthly spend limit, currently $750.5",
  );
  await trigger.click();
  await input.fill("900");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await trigger.click();
  await expect(input).toHaveValue("750.5");
});

for (const theme of ["Light", "Dark"]) {
  test(`${theme} narrow viewport retains the panel and its actions`, async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: `${theme} theme`, exact: true })
      .click();
    await page.setViewportSize({ width: 320, height: 480 });
    await page
      .getByRole("button", { name: "Share dashboard", exact: true })
      .click();
    const surface = page.locator('[data-slot="popover-content"]');
    const bounds = await surface.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(480);
    const panel = page.getByRole("dialog", { name: "Share dashboard" });
    expect(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
    expect(
      (
        await new AxeBuilder({ page })
          .include('[data-slot="popover-content"]')
          .analyze()
      ).violations,
    ).toEqual([]);
    await surface.screenshot({
      path: `test-results/popover-${theme.toLowerCase()}-mobile.png`,
    });
    await panel.getByRole("button", { name: "Done" }).click();
    await expect(panel).toHaveCount(0);
  });
}
