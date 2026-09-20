import { expect, test } from "@playwright/test";

test("spring animates through intermediate positions and settles without moving the track", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/components/switch");
  const input = page.getByRole("switch", {
    name: "Spring motion",
    exact: true,
  });
  await input.scrollIntoViewIfNeeded();
  await expect(
    input.locator("..").locator("[data-slot=switch-thumb]"),
  ).toHaveAttribute("data-animation", "spring");
  const samples = await input.evaluate(async (element) => {
    const root = element.parentElement!;
    const thumb = root.querySelector<HTMLElement>("[data-slot=switch-thumb]")!;
    const track = root.getBoundingClientRect();
    const start = thumb.getBoundingClientRect().x;
    (element as HTMLInputElement).click();
    const xs: number[] = [];
    for (let frame = 0; frame < 45; frame++) {
      await new Promise(requestAnimationFrame);
      xs.push(thumb.getBoundingClientRect().x);
    }
    return {
      start,
      xs,
      trackBefore: track.x,
      trackAfter: root.getBoundingClientRect().x,
    };
  });
  const end = samples.xs.at(-1)!;
  expect(end - samples.start).toBeGreaterThan(10);
  expect(samples.xs.some((x) => x > samples.start + 1 && x < end - 1)).toBe(
    true,
  );
  expect(Math.abs(samples.xs.at(-5)! - end)).toBeLessThan(0.5);
  expect(samples.trackAfter).toBe(samples.trackBefore);
  await expect(input).toBeChecked();
  await input.focus();
  await input.press("Space");
  await expect(input).not.toBeChecked();
  await expect(input).toBeFocused();
  expect(errors).toEqual([]);
});

test("all sizes and RTL settle at the correct end; rapid toggles keep the final state", async ({
  page,
}) => {
  await page.goto("/components/switch");
  for (const name of ["Small spring", "Large spring", "RTL spring"]) {
    const input = page.getByRole("switch", { name, exact: true });
    await input.scrollIntoViewIfNeeded();
    await expect(
      input.locator("..").locator("[data-slot=switch-thumb]"),
    ).toHaveAttribute("data-animation", "spring");
    const before = await input
      .locator("..")
      .locator("[data-slot=switch-thumb]")
      .boundingBox();
    await input.click();
    await page.waitForTimeout(650);
    const after = await input
      .locator("..")
      .locator("[data-slot=switch-thumb]")
      .boundingBox();
    expect(before!.x - after!.x).toBeGreaterThan(8);
    await input.press("Space");
    await input.press("Space");
    await input.press("Space");
    await page.waitForTimeout(650);
    const final = await input
      .locator("..")
      .locator("[data-slot=switch-thumb]")
      .boundingBox();
    expect(Math.abs(final!.x - before!.x)).toBeLessThan(0.5);
  }
  await expect(
    page.getByRole("switch", { name: "Disabled spring" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("switch", { name: "Disabled spring" }),
  ).toBeChecked();
});

test("reduced motion changes position immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/switch");
  const input = page.getByRole("switch", {
    name: "Spring motion",
    exact: true,
  });
  await input.scrollIntoViewIfNeeded();
  await expect(
    input.locator("..").locator("[data-slot=switch-thumb]"),
  ).toHaveAttribute("data-animation", "spring");
  const xs = await input.evaluate(async (element) => {
    const thumb = element.parentElement!.querySelector<HTMLElement>(
      "[data-slot=switch-thumb]",
    )!;
    const values = [thumb.getBoundingClientRect().x];
    (element as HTMLInputElement).click();
    for (let frame = 0; frame < 8; frame++) {
      await new Promise(requestAnimationFrame);
      values.push(thumb.getBoundingClientRect().x);
    }
    return values;
  });
  expect(xs.at(-1)! - xs[0]!).toBeGreaterThan(10);
  expect(Math.max(...xs.slice(1)) - Math.min(...xs.slice(1))).toBeLessThan(0.5);
});
