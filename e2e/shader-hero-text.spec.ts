import { expect, test, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function pixels(heading: Locator) {
  return heading.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext("webgl")!;
    const data = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(
      0,
      0,
      canvas.width,
      canvas.height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );
    let sum = 0,
      weightedX = 0,
      hash = 2166136261;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]!;
      sum += alpha;
      weightedX += ((i / 4) % canvas.width) * alpha;
      for (let channel = 0; channel < 4; channel++)
        hash = Math.imul(hash ^ data[i + channel]!, 16777619);
    }
    return {
      sum,
      x: weightedX / Math.max(1, sum) / canvas.width,
      hash: hash >>> 0,
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/components/shader-hero-text");
  await expect(
    page.getByRole("heading", { name: "ShaderHeroText", exact: true }),
  ).toBeVisible();
});

test("particles are drawn, follow the mouse, return to their exact glyph pattern and stop drawing", async ({
  page,
}) => {
  const heading = page.locator(
    '[data-slot="shader-hero-text"][data-animation="particle-follow"]',
  );
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("data-state", "formed");
  const formed = await pixels(heading);
  expect(formed.sum).toBeGreaterThan(50_000);
  await heading.screenshot({
    path: "test-results/shader-particles-formed.png",
  });
  const box = (await heading.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.55, {
    steps: 12,
  });
  await expect(heading).toHaveAttribute("data-state", "following");
  await expect
    .poll(async () => (await pixels(heading)).x)
    .toBeGreaterThan(formed.x + 0.15);
  await heading.screenshot({
    path: "test-results/shader-particles-following.png",
  });
  await page.mouse.move(box.x - 25, box.y);
  await expect(heading).toHaveAttribute("data-state", "formed", {
    timeout: 2500,
  });
  expect((await pixels(heading)).hash).toBe(formed.hash);
  await expect(heading).toHaveAttribute("data-animating", "false");
  await heading.screenshot({
    path: "test-results/shader-particles-returned.png",
  });

  // Count actual GPU draws, rather than trusting only the public state marker.
  await heading.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext("webgl")!;
    const original = gl.drawArrays.bind(gl);
    canvas.dataset.draws = "0";
    gl.drawArrays = (...args) => {
      canvas.dataset.draws = String(Number(canvas.dataset.draws) + 1);
      original(...args);
    };
  });
  await page.waitForTimeout(200);
  await expect(heading.locator("canvas")).toHaveAttribute("data-draws", "0");
});

test("rapid re-entry, theme changes and static mode retain usable text", async ({
  page,
}) => {
  const preview = page.locator('[data-preview="particle-follow"]');
  const heading = preview.locator('[data-slot="shader-hero-text"]');
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("data-state", "formed");
  const box = (await heading.boundingBox())!;
  await page.mouse.move(box.x + 100, box.y + 40);
  await expect(heading).toHaveAttribute("data-state", "following");
  await page.mouse.move(box.x - 10, box.y);
  await page.mouse.move(box.x + 220, box.y + 50);
  await expect(heading).toHaveAttribute("data-state", "following");
  await page.mouse.move(box.x - 10, box.y);
  await expect(heading).toHaveAttribute("data-state", "formed");
  await preview.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(heading).toHaveAttribute("data-state", "formed");
  expect((await pixels(heading)).sum).toBeGreaterThan(50_000);
  await preview.getByRole("button", { name: "Static", exact: true }).click();
  await expect(heading).toHaveAttribute("data-rendering", "false");
  await expect(heading.locator("canvas")).toHaveCount(0);
  expect(
    await heading
      .locator('[data-slot="shader-hero-text-content"]')
      .evaluate((element) => getComputedStyle(element).color),
  ).not.toBe("rgba(0, 0, 0, 0)");
});

for (const effect of [
  "liquid-ripple",
  "chromatic-refraction",
  "noise-dissolve",
  "wave-distortion",
  "liquid-metal",
]) {
  test(`${effect} draws changing GPU frames and finishes without layout shift`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const preview = page.locator(`[data-preview="${effect}"]`);
    const heading = preview.locator('[data-slot="shader-hero-text"]');
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toHaveAttribute("data-state", "complete");
    const before = await heading.boundingBox();
    await preview.getByRole("button", { name: "Replay", exact: true }).click();
    await expect(heading).toHaveAttribute("data-state", "running");
    await page.waitForTimeout(250);
    const first = await pixels(heading);
    expect(first.sum).toBeGreaterThan(500);
    await heading.screenshot({ path: `test-results/shader-${effect}.png` });
    await expect
      .poll(async () => (await pixels(heading)).hash)
      .not.toBe(first.hash);
    await expect(heading).toHaveAttribute("data-state", "complete");
    await expect(heading.locator("canvas")).toHaveCount(0);
    expect(await heading.boundingBox()).toEqual(before);
    expect(errors).toEqual([]);
  });
}

test("context loss restores HTML and can rebuild particles after restoration", async ({
  page,
}) => {
  const heading = page.locator(
    '[data-slot="shader-hero-text"][data-animation="particle-follow"]',
  );
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("data-state", "formed");
  await heading.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const extension = canvas
      .getContext("webgl")!
      .getExtension("WEBGL_lose_context")!;
    extension.loseContext();
    setTimeout(() => extension.restoreContext(), 350);
  });
  await expect(heading).toHaveAttribute("data-rendering", "false");
  await expect(heading).toHaveAttribute("data-state", "formed");
  expect((await pixels(heading)).sum).toBeGreaterThan(50_000);
  await page
    .getByRole("heading", { name: "Installation", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(heading.locator("canvas")).toHaveCount(0);
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("data-state", "formed");
});

test("OS reduced motion cancels following; forced colors and accessibility stay readable", async ({
  page,
}) => {
  const heading = page.locator(
    '[data-slot="shader-hero-text"][data-animation="particle-follow"]',
  );
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("data-state", "formed");
  const box = (await heading.boundingBox())!;
  await page.mouse.move(box.x + 150, box.y + 50);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(heading.locator("canvas")).toHaveCount(0);
  await expect(heading).toHaveAttribute("data-rendering", "false");
  const audit = await new AxeBuilder({ page })
    .include('[data-preview="particle-follow"]')
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.emulateMedia({
    reducedMotion: "no-preference",
    forcedColors: "active",
  });
  await expect(heading.locator("canvas")).toHaveCount(0);
});

test("mobile coarse pointer preserves text and has no horizontal overflow", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: "http://localhost:5279",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/components/shader-hero-text");
  const heading = page.locator(
    '[data-slot="shader-hero-text"][data-animation="particle-follow"]',
  );
  await heading.scrollIntoViewIfNeeded();
  await expect(heading.locator("canvas")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await heading.screenshot({ path: "test-results/shader-mobile.png" });
  await context.close();
});

test("edited copy, font changes and responsive resizing rebuild formed particles", async ({
  page,
}) => {
  const preview = page.locator('[data-preview="particle-follow"]');
  const heading = preview.locator('[data-slot="shader-hero-text"]');
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("data-state", "formed");
  await preview.getByRole("button", { name: "Edit text", exact: true }).click();
  await preview
    .getByRole("textbox", { name: "Headline text" })
    .fill("New ideas.\nNew directions.");
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveText("New ideas.\nNew directions.");
  await expect(heading).toHaveAttribute("data-state", "formed");
  await heading.evaluate((element) => {
    element.style.fontFamily = "Georgia, serif";
    element.style.fontSize = "48px";
  });
  await expect
    .poll(async () => (await pixels(heading)).sum)
    .toBeGreaterThan(30_000);
  await page.setViewportSize({ width: 950, height: 850 });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("data-state", "formed");
  const bounds = (await heading.boundingBox())!;
  expect(bounds.width).toBeLessThan(950);
  await page.mouse.move(bounds.x + bounds.width * 0.75, bounds.y + 30);
  await expect(heading).toHaveAttribute("data-state", "following");
  await page.mouse.move(bounds.x - 20, bounds.y);
  await expect(heading).toHaveAttribute("data-state", "formed");
});

test("unavailable WebGL leaves visible HTML and no error overlay", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl") return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.reload();
  const heading = page.locator(
    '[data-slot="shader-hero-text"][data-animation="particle-follow"]',
  );
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("data-state", "fallback");
  await expect(heading.locator("canvas")).toHaveCount(0);
  expect(
    await heading
      .locator('[data-slot="shader-hero-text-content"]')
      .evaluate((element) => getComputedStyle(element).color),
  ).not.toBe("rgba(0, 0, 0, 0)");
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
});
