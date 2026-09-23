import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/slider");
});
test("numeric range and precision keyboard interactions", async ({ page }) => {
  const low = page.getByRole("slider", {
    name: "Minimum Monthly budget",
    exact: true,
  });
  const high = page.getByRole("slider", {
    name: "Maximum Monthly budget",
    exact: true,
  });
  await low.focus();
  await low.press("End");
  await expect(low).toHaveValue("3600");
  await high.focus();
  await high.press("Home");
  await expect(high).toHaveValue("3600");
  const speed = page.getByRole("slider", {
    name: "Playback speed",
    exact: true,
  });
  await speed.focus();
  await speed.press("ArrowRight");
  await expect(speed).toHaveValue("1.5");
  await expect(
    page.getByText("Applied speed 1.50×", { exact: true }),
  ).toContainText("1.50");
});
test("numeric drag follows the pointer and track clicks choose a value", async ({
  page,
}) => {
  const region = page.getByRole("region", {
    name: "Precision control",
    exact: true,
  });
  const track = region.locator('[data-slot="slider-track"]');
  await track.scrollIntoViewIfNeeded();
  const box = (await track.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
  const input = region.getByRole("slider");
  expect(Number(await input.inputValue())).toBeGreaterThan(1.5);
  const thumb = (await region
    .locator('[data-slot="slider-thumb"]')
    .boundingBox())!;
  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(input).toHaveValue("0.25");
});
test("RTL keyboard direction and accessible examples", async ({ page }) => {
  const rtl = page.getByRole("slider", {
    name: "Compact · right to left",
    exact: true,
  });
  await rtl.focus();
  await rtl.press("ArrowLeft");
  await expect(rtl).toHaveValue("61");
  const results = await new AxeBuilder({ page })
    .include('[data-slot="slider"]')
    .analyze();
  expect(results.violations).toEqual([]);
});

test("stepper maps equal stops to labels and range endpoints", async ({
  page,
}) => {
  const movement = page.getByRole("slider", { name: "Movement", exact: true });
  await movement.focus();
  await movement.press("End");
  await expect(movement).toHaveAttribute("aria-valuetext", "Rapid");
  await movement.press("Home");
  await expect(movement).toHaveAttribute("aria-valuetext", "Still");
  const low = page.getByRole("slider", {
    name: "Slowest Allowed speed range",
    exact: true,
  });
  await low.focus();
  await low.press("End");
  await expect(low).toHaveAttribute("aria-valuetext", "Fast");
  await low.press("Tab");
  await expect(
    page.getByRole("slider", {
      name: "Fastest Allowed speed range",
      exact: true,
    }),
  ).toBeFocused();
});
