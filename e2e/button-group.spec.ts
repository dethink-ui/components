import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/button-group");
});
test("review actions retain per-document decisions and native focus", async ({
  page,
}) => {
  const region = page.getByRole("region", {
    name: "A considered decision",
    exact: true,
  });
  const approve = region.getByRole("button", { name: "Approve", exact: true });
  await approve.focus();
  await approve.press("ArrowRight");
  await expect(approve).toBeFocused();
  await approve.press("Enter");
  await expect(approve).toBeDisabled();
  await expect(region.getByRole("status")).toHaveText(
    "New onboarding flow: Approved.",
  );
  await region.getByRole("button", { name: "Next document" }).click();
  await expect(approve).toBeEnabled();
  await region.getByRole("button", { name: "Changes", exact: true }).click();
  await expect(region.getByRole("status")).toHaveText(
    "Workspace permissions: Changes requested.",
  );
  await region.getByRole("button", { name: "Next document" }).click();
  await region.getByRole("button", { name: "Next document" }).click();
  await expect(approve).toBeDisabled();
});
test("canvas zoom respects bounds and reset", async ({ page }) => {
  const region = page.getByRole("region", {
    name: "A closer look",
    exact: true,
  });
  const zoomIn = region.getByRole("button", { name: "Zoom in", exact: true });
  await zoomIn.click();
  await zoomIn.click();
  await expect(zoomIn).toBeDisabled();
  await expect(region.getByLabel("Canvas zoom", { exact: true })).toHaveText(
    "150%",
  );
  const zoomOut = region.getByRole("button", { name: "Zoom out", exact: true });
  for (let i = 0; i < 4; i++) await zoomOut.click();
  await expect(zoomOut).toBeDisabled();
  await region.getByRole("button", { name: "Reset zoom" }).click();
  await expect(region.getByLabel("Canvas zoom", { exact: true })).toHaveText(
    "100%",
  );
});
test("week actions change and reset the visible dates", async ({ page }) => {
  const region = page.getByRole("region", {
    name: "Make room for the week",
    exact: true,
  });
  await region.getByRole("button", { name: "Next week" }).click();
  await expect(
    region.getByRole("heading", { name: "28 Sept – 4 Oct", exact: true }),
  ).toBeVisible();
  await region.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(
    region.getByRole("heading", { name: "21 Sept – 27 Sept", exact: true }),
  ).toBeVisible();
  await region.getByRole("button", { name: "Previous week" }).click();
  await expect(
    region.getByRole("heading", { name: "14 Sept – 20 Sept", exact: true }),
  ).toBeVisible();
});
for (const theme of ["light", "dark"] as const)
  test(`mobile ${theme} examples fit and remain accessible`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.reload();
    for (const name of [
      "A considered decision",
      "A closer look",
      "Make room for the week",
      "Layouts and states",
      "Wide group to narrow overflow",
    ]) {
      const region = page.getByRole("region", { name, exact: true });
      await region.scrollIntoViewIfNeeded();
      expect(
        await region.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      ).toBe(true);
      await region.screenshot({
        path: testInfo.outputPath(`${name.replaceAll(" ", "-")}.png`),
      });
    }
    const result = await new AxeBuilder({ page })
      .include('[data-slot="button-group"]')
      .analyze();
    expect(result.violations).toEqual([]);
  });

test("responsive actions preserve availability across layouts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  const region = page.getByRole("region", {
    name: "Wide group to narrow overflow",
    exact: true,
  });
  await expect(region.locator('[data-layout="wide"]')).toBeVisible();
  await expect(
    region.getByRole("button", { name: "Export", exact: true }),
  ).toBeDisabled();
  await region.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    region.getByText("Share selected for Quarterly report.", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(region.locator('[data-layout="narrow"]')).toBeVisible();
  await region
    .getByRole("button", { name: "More quarterly report actions", exact: true })
    .click();
  await expect(
    page.getByRole("menuitem", { name: "Export", exact: true }),
  ).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("menuitem", { name: "Archive", exact: true }).click();
  await expect(
    region.getByText("Archive selected for Quarterly report.", { exact: true }),
  ).toBeVisible();
});
