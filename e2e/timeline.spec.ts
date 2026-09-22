import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("details, contained feed, and responsive canvas", async ({ page }) => {
  await page.goto("/components/timeline");
  const disclosure = page.getByRole("button", {
    name: /details for Release approved/,
  });
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  const feed = page.locator('[data-slot="timeline-feed"]');
  const viewport = feed.locator('[data-slot="timeline-feed-viewport"]');
  await viewport.scrollIntoViewIfNeeded();
  await viewport.focus();
  await viewport.press("Control+Home");
  await viewport.evaluate((el) => {
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
  });
  await page.getByRole("button", { name: "Add event", exact: true }).click();
  await expect(feed.getByRole("button", { name: /1 new event/ })).toBeVisible();
  await page.getByRole("button", { name: "Load earlier" }).click();
  await expect(feed.getByRole("button", { name: /1 new event/ })).toBeVisible();
  await feed.getByRole("button", { name: /Jump to latest/ }).focus();
  await feed.getByRole("button", { name: /Jump to latest/ }).press("Enter");
  await expect(
    feed.getByRole("button", { name: "Following latest" }),
  ).toBeFocused();
  expect(
    await viewport.evaluate(
      (el) => el.scrollHeight - el.clientHeight - el.scrollTop,
    ),
  ).toBeLessThan(2);
  const canvas = page
    .locator('[data-slot="timeline"][data-presentation="canvas"]')
    .first();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await canvas.scrollIntoViewIfNeeded();
    const actions = canvas.locator('[data-slot="timeline-card-action"]');
    await actions.first().focus();
    await actions.first().press("End");
    await expect(actions.last()).toBeFocused();
    await expect
      .poll(async () =>
        actions.last().evaluate((el) => {
          const box = el.getBoundingClientRect();
          const viewport = el
            .closest('[data-slot="timeline-viewport"]')!
            .getBoundingClientRect();
          return (
            box.left >= viewport.left - 1 && box.right <= viewport.right + 1
          );
        }),
      )
      .toBe(true);
  }
  const result = await new AxeBuilder({ page })
    .include('[data-slot="timeline-feed"]')
    .analyze();
  expect(result.violations).toEqual([]);
});

test("server content stays readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:5291/components/timeline");
  const item = page.locator('[data-slot="timeline-item"]').first();
  await expect(item).toBeVisible();
  expect(await item.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await context.close();
});

test("reduced motion, dark mode and RTL preserve keyboard access", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/components/timeline");
  await page.locator("html").evaluate((el) => {
    el.dir = "rtl";
    el.classList.add("dark");
  });
  const canvas = page
    .locator('[data-slot="timeline"][data-presentation="canvas"]')
    .first();
  const actions = canvas.locator('[data-slot="timeline-card-action"]');
  await actions.first().focus();
  await actions.first().press("ArrowLeft");
  await expect(actions.nth(1)).toBeFocused();
  const moving = page
    .locator('[data-slot="timeline-item"][data-reveal]')
    .first();
  if (await moving.count())
    expect(
      await moving.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
  await canvas.getByRole("button", { name: /Reset/ }).click();
  await expect(actions.first()).toBeVisible();
});
