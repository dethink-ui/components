import { expect, test, type Page } from "@playwright/test";

test.use({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});

async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        function frame(now: number) {
          if (now - start > 700) resolve();
          else requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }),
  );
}

test("proximity magnifies neighbors and side icons stay centered", async ({
  page,
}) => {
  await page.goto("/components/navdock");
  const dock = page.getByRole("navigation", {
    name: "Playground navigation dock",
  });
  const items = dock.locator('[data-slot="navdock-item-icon"]');
  for (const placement of ["bottom", "left", "right"] as const) {
    await page
      .getByRole("radiogroup", { name: "Placement", exact: true })
      .getByRole("radio", { name: placement, exact: true })
      .check();
    await dock.scrollIntoViewIfNeeded();
    await page.mouse.move(20, 200);
    await settle(page);
    const initial = (await items.nth(2).boundingBox())!;
    await dock.getByRole("button", { name: "Projects", exact: true }).hover();
    await settle(page);
    const active = (await items.nth(2).boundingBox())!;
    const scales = await items.evaluateAll((icons) =>
      icons.map(
        (el) =>
          el.getBoundingClientRect().width / (el as HTMLElement).offsetWidth,
      ),
    );
    expect(scales[2]).toBeGreaterThan(1.35);
    expect(scales[1]).toBeGreaterThan(1.05);
    expect(scales[2]).toBeGreaterThan(scales[1]);
    if (placement !== "bottom") {
      expect(
        Math.abs(active.x + active.width / 2 - initial.x - initial.width / 2),
      ).toBeLessThan(1);
    }
    await page.mouse.move(20, 200);
    await settle(page);
    expect(
      (await items.nth(2).boundingBox())!.width / initial.width,
    ).toBeCloseTo(1, 1);
  }
});

test("collapse shell settles without overshoot and keeps its trigger anchored", async ({
  page,
}) => {
  await page.goto("/components/navdock");
  const dock = page.getByRole("navigation", { name: "Mobile workspace dock" });
  await dock.scrollIntoViewIfNeeded();
  await settle(page);
  for (const opening of [true, false, true, false]) {
    const sample = await dock.evaluate(async (el) => {
      const shell = el.querySelector<HTMLElement>(
        '[data-slot="navdock-collapsed-shell"]',
      )!;
      const trigger = el.querySelector<HTMLButtonElement>(
        '[data-slot="navdock-collapse-trigger"]',
      )!;
      const initial = trigger.getBoundingClientRect();
      const heights: number[] = [];
      const centers: number[] = [];
      trigger.click();
      await new Promise<void>((resolve) => {
        const start = performance.now();
        function frame(now: number) {
          const button = trigger.getBoundingClientRect();
          heights.push(shell.getBoundingClientRect().height);
          centers.push(button.y + button.height / 2);
          if (now - start > 800) resolve();
          else requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
      return {
        heights,
        centers,
        initialCenter: initial.y + initial.height / 2,
      };
    });
    expect(
      Math.max(
        ...sample.centers.map((center) =>
          Math.abs(center - sample.initialCenter),
        ),
      ),
    ).toBeLessThan(1);
    for (let i = 1; i < sample.heights.length; i++) {
      const delta = sample.heights[i] - sample.heights[i - 1];
      expect(opening ? delta : -delta).toBeGreaterThanOrEqual(-0.2);
    }
  }
});
