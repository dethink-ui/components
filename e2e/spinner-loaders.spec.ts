import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/feedback-states");
  await page
    .getByRole("heading", { name: "Animated loaders", exact: true })
    .scrollIntoViewIfNeeded();
});

test("dot grows on ascent, shrinks on descent and stays inside every size", async ({
  page,
}) => {
  const dots = page.locator(
    '[data-slot="spinner"][data-variant="bouncing-dot"]',
  );
  await expect(dots).toHaveCount(6);
  for (const spinner of await dots.all()) {
    const samples = await spinner.evaluate(async (element) => {
      const dot = element.firstElementChild!;
      const shadow = element.querySelector('[data-slot="spinner-shadow"]')!;
      const shadowAnimation = shadow.getAnimations()[0];
      if (!shadowAnimation) throw new Error("Shadow has no animation");
      shadowAnimation.pause();
      await shadowAnimation.ready;
      const animation = dot.getAnimations()[0];
      if (!animation) throw new Error("Bouncing dot has no animation");
      animation.pause();
      await animation.ready;
      const duration = Number(animation.effect!.getTiming().duration);
      const bounds = element.getBoundingClientRect();
      return Array.from({ length: 21 }, (_, index) => {
        animation.currentTime = (index / 20) * duration;
        shadowAnimation.currentTime = (index / 20) * duration;
        const shadowStyle = getComputedStyle(shadow);
        const box = dot.getBoundingClientRect();
        return {
          y: box.y,
          width: box.width,
          shadowBlur: parseFloat(shadowStyle.filter.replace("blur(", "")),
          shadowOpacity: Number(shadowStyle.opacity),
          shadowWidth: shadow.getBoundingClientRect().width,
          shadowDepth: new DOMMatrix(shadowStyle.transform).m43,
          inside:
            box.left >= bounds.left - 0.1 &&
            box.right <= bounds.right + 0.1 &&
            box.top >= bounds.top - 0.1 &&
            box.bottom <= bounds.bottom + 0.1,
        };
      });
    });
    expect(samples.every((sample) => sample.inside)).toBe(true);
    expect(samples[10].width).toBeGreaterThan(samples[0].width * 1.5);
    expect(samples[10].y).toBeLessThan(samples[0].y);
    expect(samples[10].shadowBlur).toBeGreaterThan(samples[0].shadowBlur);
    expect(samples[10].shadowOpacity).toBeLessThan(samples[0].shadowOpacity);
    expect(samples[10].shadowWidth).toBeGreaterThan(samples[0].shadowWidth);
    expect(samples[10].shadowDepth).toBeLessThan(samples[0].shadowDepth);
    expect(samples[20].shadowBlur).toBeCloseTo(samples[0].shadowBlur);
    for (let i = 1; i <= 10; i++) {
      expect(samples[i].width).toBeGreaterThanOrEqual(
        samples[i - 1].width - 0.01,
      );
      expect(samples[i].y).toBeLessThanOrEqual(samples[i - 1].y + 0.01);
    }
    for (let i = 11; i < samples.length; i++) {
      expect(samples[i].width).toBeLessThanOrEqual(samples[i - 1].width + 0.01);
      expect(samples[i].y).toBeGreaterThanOrEqual(samples[i - 1].y - 0.01);
    }
  }
});

test("rings rotate in opposite directions without changing the layout", async ({
  page,
}) => {
  const rings = page.locator(
    '[data-slot="spinner"][data-variant="moving-rings"]',
  );
  await expect(rings).toHaveCount(6);
  for (const spinner of await rings.all()) {
    const result = await spinner.evaluate(async (element) => {
      const before = element.getBoundingClientRect();
      const circles = Array.from(element.querySelectorAll("circle"));
      const rotations = [];
      for (const circle of circles) {
        const animation = circle.getAnimations()[0];
        if (!animation) throw new Error("Ring has no animation");
        animation.pause();
        await animation.ready;
        animation.currentTime =
          Number(animation.effect!.getTiming().duration) / 8;
        rotations.push(new DOMMatrix(getComputedStyle(circle).transform).b);
      }
      const after = element.getBoundingClientRect();
      const svg = element.querySelector("svg")!;
      const viewBox = svg.viewBox.baseVal;
      const contained = circles.every((circle) => {
        const radius =
          circle.r.baseVal.value +
          parseFloat(getComputedStyle(circle).strokeWidth) / 2;
        return (
          circle.cx.baseVal.value - radius >= 0 &&
          circle.cx.baseVal.value + radius <= viewBox.width &&
          circle.cy.baseVal.value - radius >= 0 &&
          circle.cy.baseVal.value + radius <= viewBox.height
        );
      });
      return {
        rotations,
        contained,
        stable: before.width === after.width && before.height === after.height,
      };
    });
    expect(result.rotations[0]).toBeGreaterThan(0.5);
    expect(result.rotations[1]).toBeLessThan(-0.5);
    expect(result.contained).toBe(true);
    expect(result.stable).toBe(true);
  }
});

test("reduced motion stops both loaders while keeping status text and visible shapes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  for (const variant of ["bouncing-dot", "moving-rings"]) {
    const spinner = page
      .locator(`[data-slot="spinner"][data-variant="${variant}"]`)
      .first();
    await expect(spinner).toBeVisible();
    await expect
      .poll(() =>
        spinner.evaluate(
          (element) => element.getAnimations({ subtree: true }).length,
        ),
      )
      .toBe(0);
    const shapes = await spinner.evaluate((element) =>
      Array.from(element.querySelectorAll("circle, span")).map((shape) => {
        const style = getComputedStyle(shape);
        return {
          opacity: style.opacity,
          color:
            shape.tagName === "circle" ? style.stroke : style.backgroundColor,
        };
      }),
    );
    expect(shapes.length).toBeGreaterThan(0);
    for (const shape of shapes) {
      expect(Number(shape.opacity)).toBeGreaterThan(0);
      expect(shape.color).not.toBe("rgba(0, 0, 0, 0)");
      expect(shape.color).not.toBe("none");
    }
  }
  await expect(
    page.getByRole("status").filter({ hasText: "Preparing your workspace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Syncing your records" }),
  ).toBeVisible();
  await page.emulateMedia({
    reducedMotion: "no-preference",
    forcedColors: "none",
  });
  await expect
    .poll(() =>
      page
        .locator('[data-variant="bouncing-dot"]')
        .first()
        .evaluate((element) => element.getAnimations({ subtree: true }).length),
    )
    .toBe(2);
});

for (const theme of ["light", "dark"] as const) {
  test(`loader gallery renders in ${theme} on a narrow RTL layout`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
    await page.evaluate((theme) => {
      document.documentElement.dir = "rtl";
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle("dark", theme === "dark");
    }, theme);
    const gallery = page.getByRole("group", { name: "Loader variants" });
    await expect(gallery).toHaveScreenshot(`loader-gallery-${theme}.png`, {
      animations: "disabled",
      style: "nextjs-portal { display: none; }",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
