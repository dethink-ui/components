import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/slider");
});
test("vertical controls drag upward and XL thumbs stay inside the rail", async ({
  page,
}) => {
  const input = page.getByRole("slider", { name: "Voice", exact: true });
  const root = input.locator('xpath=ancestor::*[@data-slot="slider"]');
  await root.scrollIntoViewIfNeeded();
  await expect(input).toHaveAttribute("aria-orientation", "vertical");
  const track = (await root
    .locator('[data-slot="slider-track"]')
    .boundingBox())!;
  await page.mouse.click(
    track.x + track.width / 2,
    track.y + track.height * 0.25,
  );
  expect(Number(await input.inputValue())).toBeGreaterThan(70);
  for (const key of ["Home", "End"]) {
    await input.press(key);
    const rail = (await root
      .locator('[data-slot="slider-rail"]')
      .boundingBox())!;
    const thumb = (await root
      .locator('[data-slot="slider-thumb-visual"]')
      .boundingBox())!;
    expect(thumb.y).toBeGreaterThan(rail.y);
    expect(thumb.y + thumb.height).toBeLessThan(rail.y + rail.height);
  }
  await page.mouse.move(track.x + track.width / 2, track.y);
  await page.mouse.down();
  await page.mouse.move(track.x + track.width / 2, track.y + track.height, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(input).toHaveValue("0");
  const preset = page.getByRole("slider", { name: "Focus level", exact: true });
  await preset.press("End");
  await expect(preset).toHaveAttribute("aria-valuetext", "Deep");
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

test("XL thumb stays inside its rail at both endpoints", async ({ page }) => {
  const input = page.getByRole("slider", {
    name: "Extra large · inset thumb",
    exact: true,
  });
  const root = input.locator('xpath=ancestor::*[@data-slot="slider"]');
  for (const key of ["Home", "End"]) {
    await input.press(key);
    const { rail, thumb } = await root.evaluate((el) => {
      const measure = (selector: string) => {
        const r = el.querySelector(selector)!.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      return {
        rail: measure('[data-slot="slider-rail"]'),
        thumb: measure('[data-slot="slider-thumb-visual"]'),
      };
    });
    expect(thumb.x).toBeGreaterThan(rail.x);
    expect(thumb.x + thumb.width).toBeLessThan(rail.x + rail.width);
    expect(thumb.y).toBeGreaterThan(rail.y);
    expect(thumb.y + thumb.height).toBeLessThan(rail.y + rail.height);
  }
});

test("reduced motion starts paused and removes decorative effects", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const preview = page.locator('[data-slot="motion-preview"]');
  await expect(preview).toHaveAttribute("data-paused", "true");
  const orbit = page.locator('[data-slot="motion-orbit"]');
  const transform = await orbit.getAttribute("style");
  const input = page.getByRole("slider", { name: "Motion speed", exact: true });
  await input.press("End");
  await expect(input).toHaveAttribute("aria-valuetext", "Rapid");
  await expect(preview).toHaveAttribute("data-speed", "4");
  await expect(page.locator('[data-slot="slider-pulse"]')).toHaveCount(0);
  await expect(orbit).toHaveAttribute("style", transform!);
  await page
    .getByRole("button", { name: "Play motion preview", exact: true })
    .click();
  await expect(preview).toHaveAttribute("data-paused", "false");
  await page
    .getByRole("button", { name: "Pause motion preview", exact: true })
    .click();
  await expect(preview).toHaveAttribute("data-paused", "true");
});

for (const theme of ["light", "dark"] as const) {
  test(`mobile ${theme} labels remain bounded`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.reload();
    const region = page.getByRole("region", {
      name: "Motion speed",
      exact: true,
    });
    await region.scrollIntoViewIfNeeded();
    const overflow = await region.evaluate(
      (el) => el.scrollWidth > el.clientWidth + 1,
    );
    expect(overflow).toBe(false);
    const marks = region.locator('[data-slot="slider-marks"] > span');
    const boxes = await marks.evaluateAll((elements) =>
      elements.map((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        return { left: r.left, right: r.right };
      }),
    );
    for (let i = 1; i < boxes.length; i++)
      expect(boxes[i].left).toBeGreaterThanOrEqual(boxes[i - 1].right - 1);
    await region.screenshot({
      path: testInfo.outputPath(`slider-${theme}-mobile.png`),
    });
  });
}

test("high contrast retains focus and value semantics", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  const input = page.getByRole("slider", { name: "Motion speed", exact: true });
  await input.press("ArrowRight");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-valuetext", "Fast");
  await page
    .getByRole("region", { name: "Motion speed", exact: true })
    .screenshot({ path: testInfo.outputPath("slider-high-contrast.png") });
});

test("touch selects a step and follows a drag", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3005/components/slider");
  const region = page.getByRole("region", {
    name: "Motion speed",
    exact: true,
  });
  const track = region.locator('[data-slot="slider-track"]');
  await track.scrollIntoViewIfNeeded();
  const box = (await track.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width, box.y + box.height / 2);
  const input = region.getByRole("slider");
  await expect(input).toHaveAttribute("aria-valuetext", "Rapid");
  const cdp = await context.newCDPSession(page);
  const y = box.y + box.height / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: box.x + box.width, y }],
  });
  for (let i = 4; i >= 0; i--)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: box.x + (box.width * i) / 4, y }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(input).toHaveAttribute("aria-valuetext", "Still");
  await context.close();
});

test("stepper glides for keys and clicks but never trails a drag", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const input = page.getByRole("slider", { name: "Movement", exact: true });
  const root = input.locator('xpath=ancestor::*[@data-slot="slider"]');
  await root.scrollIntoViewIfNeeded();
  const thumb = root.locator('[data-slot="slider-thumb"]');
  const track = root.locator('[data-slot="slider-track"]');
  expect(
    await thumb.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0.18s");
  await input.press("End");
  await expect(input).toHaveAttribute("aria-valuetext", "Rapid");
  await expect
    .poll(async () =>
      root.evaluate((el) => {
        const rail = el
          .querySelector('[data-slot="slider-track"]')!
          .getBoundingClientRect();
        const thumb = el
          .querySelector('[data-slot="slider-thumb"]')!
          .getBoundingClientRect();
        return Math.abs(thumb.x + thumb.width / 2 - rail.right);
      }),
    )
    .toBeLessThan(1);
  const box = (await track.boundingBox())!;
  await page.mouse.click(box.x, box.y + box.height / 2);
  await expect(input).toHaveAttribute("aria-valuetext", "Still");
  await expect
    .poll(async () =>
      root.evaluate((el) => {
        const rail = el
          .querySelector('[data-slot="slider-track"]')!
          .getBoundingClientRect();
        const thumb = el
          .querySelector('[data-slot="slider-thumb"]')!
          .getBoundingClientRect();
        return Math.abs(thumb.x + thumb.width / 2 - rail.left);
      }),
    )
    .toBeLessThan(1);
  await page.mouse.move(box.x, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 4,
  });
  expect(
    await thumb.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await expect(input).toHaveAttribute("aria-valuetext", "Steady");
  await page.mouse.up();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await thumb.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
});

test("meeting range thumbs expose only one bounded floating label", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const low = page.getByRole("slider", {
    name: "Minimum Monthly budget",
    exact: true,
  });
  await low.press("End");
  const root = low.locator('xpath=ancestor::*[@data-slot="slider"]');
  await expect(
    root.locator('[data-slot="slider-floating-output"]'),
  ).toHaveCount(1);
  const high = page.getByRole("slider", {
    name: "Maximum Monthly budget",
    exact: true,
  });
  await high.press("Tab");
  await high.focus();
  await high.press("End");
  await expect(
    root.locator('[data-slot="slider-floating-output"]'),
  ).toHaveCount(1);
  const geometry = await root.evaluate((el) => {
    const outer = el.getBoundingClientRect();
    const label = el
      .querySelector('[data-slot="slider-floating-output"]')!
      .getBoundingClientRect();
    return { left: label.left - outer.left, right: outer.right - label.right };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeGreaterThanOrEqual(0);
});
