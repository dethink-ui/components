import { expect, test, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const effects = [
  "liquid-mesh",
  "silk-flow",
  "caustic-light",
  "contour-field",
  "orbital-glow",
] as const;
// Read inside an actual GPU draw: production does not retain drawing buffers.
async function pixels(root: Locator) {
  return root.locator("canvas").evaluate(
    (canvas: HTMLCanvasElement) =>
      new Promise<{ hash: number; range: number; pixels: number }>(
        (resolve) => {
          const gl = canvas.getContext("webgl")!,
            draw = gl.drawArrays.bind(gl);
          gl.drawArrays = (...args) => {
            draw(...args);
            gl.drawArrays = draw;
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
            let hash = 2166136261,
              min = 255,
              max = 0;
            for (let i = 0; i < data.length; i += 16) {
              for (let channel = 0; channel < 3; channel++) {
                const value = data[i + channel]!;
                hash = Math.imul(hash ^ value, 16777619);
              }
              const luminance = (data[i]! + data[i + 1]! + data[i + 2]!) / 3;
              min = Math.min(min, luminance);
              max = Math.max(max, luminance);
            }
            resolve({
              hash: hash >>> 0,
              range: max - min,
              pixels: canvas.width * canvas.height,
            });
          };
        },
      ),
  );
}

for (const effect of effects)
  test(`${effect}: pixels animate, pause/resume, themes, and foreground actions work`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/components/${effect}-background`);
    const preview = page.locator(`[data-preview="${effect}"]`),
      root = preview.locator(`[data-effect="${effect}"]`);
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveAttribute("data-state", "running");
    const a = await pixels(root);
    expect(a.range).toBeGreaterThan(20);
    expect(a.pixels).toBeLessThanOrEqual(1_000_000);
    await expect.poll(async () => (await pixels(root)).hash).not.toBe(a.hash);
    await root.screenshot({
      path: `test-results/${info.project.name}-${effect}.png`,
    });
    const pause = preview.getByRole("button", { name: "Pause animation" });
    await pause.focus();
    await page.keyboard.press("Space");
    await expect(root).toHaveAttribute("data-state", "static");
    await expect(root.locator("canvas")).toHaveCount(0);
    await preview.getByRole("button", { name: "Join the preview" }).click();
    await expect(preview.getByRole("status")).toContainText("Demo confirmed");
    await preview.getByRole("button", { name: "Resume animation" }).click();
    await expect(root).toHaveAttribute("data-state", "running");
    await preview.getByRole("button", { name: "Dark theme" }).click();
    expect((await pixels(root)).range).toBeGreaterThan(20);
    await root.screenshot({
      path: `test-results/${info.project.name}-${effect}-light.png`,
    });
    expect(errors).toEqual([]);
  });

test("reduced motion, forced colors and print stop rendering without hiding content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/shader-backgrounds");
  for (const effect of effects) {
    const root = page.locator(`[data-effect="${effect}"]`);
    await root.scrollIntoViewIfNeeded();
    await expect(root.locator("canvas")).toHaveCount(0);
    await expect(root.getByRole("heading")).toBeVisible();
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const root = page.locator('[data-effect="orbital-glow"]');
  await expect(root).toHaveAttribute("data-state", "running");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(root.locator("canvas")).toHaveCount(0);
  await page.emulateMedia({ forcedColors: "none" });
  await expect(root).toHaveAttribute("data-state", "running");
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  await expect(root.locator("canvas")).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(root).toHaveAttribute("data-state", "running");
});

test("context recovery, offscreen release and hidden tabs clean up GPU work", async ({
  page,
}) => {
  await page.goto("/components/liquid-mesh-background");
  const root = page.locator('[data-effect="liquid-mesh"]');
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-state", "running");
  await root.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const extension = canvas
      .getContext("webgl")!
      .getExtension("WEBGL_lose_context")!;
    extension.loseContext();
    setTimeout(() => extension.restoreContext(), 300);
  });
  await expect(root).toHaveAttribute("data-state", "fallback");
  await expect(root).toHaveAttribute("data-state", "running");
  expect((await pixels(root)).range).toBeGreaterThan(20);
  await page
    .getByRole("heading", { name: "Colors and performance" })
    .scrollIntoViewIfNeeded();
  await expect(root.locator("canvas")).toHaveCount(0);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-state", "running");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(root.locator("canvas")).toHaveCount(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(root).toHaveAttribute("data-state", "running");
});

test("optional pointer parallax, resizing and composition controls update rendering", async ({
  page,
}) => {
  await page.goto("/components/silk-flow-background");
  const root = page.locator('[data-effect="silk-flow"]');
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-state", "running");
  await page.getByRole("button", { name: "Mouse parallax" }).click();
  await expect(root).toHaveAttribute("data-state", "running");
  const box = (await root.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2);
  const pointer = () =>
    root.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      const gl = canvas.getContext("webgl")!;
      const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
      return Array.from(
        gl.getUniform(
          program,
          gl.getUniformLocation(program, "u_pointer"),
        ) as Float32Array,
      );
    });
  await expect.poll(async () => (await pointer())[0]).toBeGreaterThan(0.3);
  await page.mouse.move(0, 0);
  await expect
    .poll(async () => Math.abs((await pointer())[0]!))
    .toBeLessThan(0.03);
  await page.getByLabel("Animation speed").selectOption("fast");
  await page.getByLabel("Effect intensity").selectOption("faint");
  await page.getByRole("button", { name: "New composition" }).click();
  await page.setViewportSize({ width: 780, height: 900 });
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-state", "running");
  expect((await pixels(root)).pixels).toBeLessThanOrEqual(1_000_000);
});

test("mobile foreground remains usable and the collection has no overflow", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto("/components/shader-backgrounds");
  for (const effect of effects) {
    const root = page.locator(`[data-effect="${effect}"]`);
    await root.scrollIntoViewIfNeeded();
    await expect(root.getByRole("heading")).toBeVisible();
    await root.getByRole("button", { name: "Join the preview" }).click();
    await expect(root.getByRole("status")).toContainText("Demo confirmed");
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await context.close();
});

test("no WebGL and no JavaScript preserve every foreground", async ({
  browser,
  page,
  baseURL,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/components/shader-backgrounds");
  for (const effect of effects) {
    const root = page.locator(`[data-effect="${effect}"]`);
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveAttribute("data-state", "fallback");
    await expect(root.locator("canvas")).toHaveCount(0);
    await expect(root.getByRole("heading")).toBeVisible();
  }
  const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL,
    }),
    staticPage = await context.newPage();
  await staticPage.goto("/components/shader-backgrounds");
  await expect(
    staticPage.locator('[data-slot="shader-background-content"]'),
  ).toHaveCount(5);
  await expect(staticPage.locator("canvas")).toHaveCount(0);
  await context.close();
});

test("background decoration adds no accessibility violations", async ({
  page,
}) => {
  await page.goto("/components/liquid-mesh-background");
  await page.locator('[data-effect="liquid-mesh"]').scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Pause animation" }).click();
  const result = await new AxeBuilder({ page })
    .include('[data-preview="liquid-mesh"]')
    .analyze();
  expect(result.violations).toEqual([]);
});

test("system color preferences refresh the shader palette", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/components/liquid-mesh-background");
  const preview = page.locator('[data-preview="liquid-mesh"]');
  await preview.evaluate((el) => el.setAttribute("data-theme", "system"));
  const root = preview.locator('[data-effect="liquid-mesh"]');
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-state", "running");
  const base = () =>
    root.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      const gl = canvas.getContext("webgl")!,
        program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
      return Array.from(
        gl.getUniform(
          program,
          gl.getUniformLocation(program, "u_base"),
        ) as Float32Array,
      ).join(",");
    });
  const light = await base();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(base).not.toBe(light);
});
