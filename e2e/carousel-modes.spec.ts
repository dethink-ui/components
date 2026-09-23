import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/carousel");
});

for (const mode of ["fan", "arc", "ribbon"] as const) {
  test(`${mode}: mode switch, keyboard, pointer drag and opaque surface`, async ({
    page,
  }) => {
    const section = page.getByRole("region", {
      name: "Feature highlights",
      exact: true,
    });
    await section
      .getByRole("combobox", { name: "Presentation" })
      .selectOption(mode);
    const carousel = section.getByRole("region", {
      name: "Product capabilities",
      exact: true,
    });
    const viewport = carousel.locator('[data-slot="carousel-viewport"]');
    await carousel
      .getByRole("button", { name: "Show slide 1", exact: true })
      .click();
    await expect(carousel.locator('[data-active="true"]')).toHaveAttribute(
      "aria-label",
      "1 of 4",
    );
    await expect
      .poll(() =>
        carousel.evaluate((e) =>
          Number(
            (e as HTMLElement).style.getPropertyValue("--carousel-offset"),
          ),
        ),
      )
      .toBeCloseTo(0, 2);
    await viewport.focus();
    await viewport.press("End");
    await expect(
      carousel.getByRole("button", { name: "Next slide", exact: true }),
    ).toBeDisabled();
    await viewport.press("Home");
    await expect(carousel.locator('[data-active="true"]')).toHaveAttribute(
      "aria-label",
      "1 of 4",
    );
    await expect
      .poll(() =>
        carousel.evaluate((e) =>
          Number(
            (e as HTMLElement).style.getPropertyValue("--carousel-offset"),
          ),
        ),
      )
      .toBeCloseTo(0, 2);
    const box = await viewport.boundingBox();
    if (!box) throw new Error("Viewport missing");
    await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5, {
      steps: 16,
    });
    await page.mouse.up();
    await expect(carousel.locator('[data-active="true"]')).not.toHaveAttribute(
      "aria-label",
      "1 of 4",
    );
    await carousel
      .getByRole("button", {
        name: "Show Progress everyone can trust",
        exact: true,
      })
      .click();
    await expect
      .poll(() =>
        carousel.evaluate((e) =>
          Number(
            (e as HTMLElement).style.getPropertyValue("--carousel-offset"),
          ),
        ),
      )
      .toBeCloseTo(1, 2);
    const surface = carousel.locator('[data-active="true"] article');
    expect(
      await surface.evaluate((e) => getComputedStyle(e).backgroundColor),
    ).not.toBe("rgba(0, 0, 0, 0)");
    await expect(
      carousel.locator('[data-slot="carousel-item-content"][inert]'),
    ).toHaveCount(3);
    const before = await carousel
      .locator('[data-active="true"]')
      .getAttribute("aria-label");
    await section
      .getByRole("combobox")
      .selectOption(mode === "fan" ? "ribbon" : "fan");
    await expect(carousel.locator('[data-active="true"]')).toHaveAttribute(
      "aria-label",
      before!,
    );
  });
}

for (const width of [320, 390, 768]) {
  test(`long content fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const mode of ["fan", "arc", "ribbon", "tilt", "floor", "flat"]) {
      const section = page
        .getByRole("region", { name: "Customer testimonials", exact: true })
        .filter({ has: page.getByRole("combobox") });
      await section.getByRole("combobox").selectOption(mode);
      const carousel = section.locator('[data-slot="carousel"]');
      const figure = carousel.locator('[data-active="true"] figure');
      const size = await figure.evaluate((e) => ({
        client: e.clientHeight,
        scroll: e.scrollHeight,
      }));
      expect(size.scroll).toBeLessThanOrEqual(size.client + 2);
      const active = await figure.boundingBox();
      const controls = await carousel
        .getByRole("button", { name: "Next slide", exact: true })
        .boundingBox();
      expect(active!.y + active!.height).toBeLessThan(controls!.y);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
  });
}

test("gallery caption, dark theme, accessibility and live reduced motion", async ({
  page,
}) => {
  const section = page.getByRole("region", {
    name: "Editorial image gallery",
    exact: true,
  });
  const carousel = section.getByRole("region", {
    name: "Horizon collection",
    exact: true,
  });
  await carousel
    .getByRole("button", { name: "Show A place to pause", exact: true })
    .click();
  await expect(
    carousel.getByRole("heading", { name: "A place to pause" }),
  ).toBeVisible();
  await expect(
    carousel.getByRole("button", { name: "Next slide", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(carousel).toHaveAttribute("data-reduced-motion", "true");
  expect(
    await carousel
      .locator('[data-active="true"]')
      .evaluate((e) => getComputedStyle(e).transform),
  ).toBe("none");
  await carousel
    .getByRole("button", { name: "Previous slide", exact: true })
    .click();
  await expect(
    carousel.getByRole("heading", { name: "Quiet water" }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .include('[aria-label="Horizon collection"]')
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(carousel).not.toHaveAttribute("data-reduced-motion", "true");
});

test("pagination remains visible in forced colors", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Forced-colors emulation uses Chromium.",
  );
  await page.emulateMedia({ forcedColors: "active" });
  const carousel = page.getByRole("region", {
    name: "Product capabilities",
    exact: true,
  });
  const dots = carousel.locator('[data-slot="carousel-dot"]');
  await expect(dots).toHaveCount(4);
  const inactiveStyles = await dots.locator("span").evaluateAll((elements) =>
    elements
      .filter((e) => e.parentElement?.getAttribute("aria-current") !== "true")
      .map((e) => {
        const style = getComputedStyle(e);
        return {
          border: parseFloat(style.borderTopWidth),
          color: style.borderTopColor,
          background: style.backgroundColor,
        };
      }),
  );
  expect(inactiveStyles).toHaveLength(3);
  for (const style of inactiveStyles) {
    expect(style.border).toBeGreaterThan(0);
    expect(style.color).not.toBe(style.background);
  }
  await dots.first().click();
  await expect(dots.first()).toHaveAttribute("aria-current", "true");
});

for (const width of [390, 1440]) {
  test(`angled modes visual baseline at ${width}px`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Visual baseline uses Chromium; interactions cover both engines.",
    );
    await page.setViewportSize({ width, height: 1100 });
    const section = page.getByRole("region", {
      name: "Feature highlights",
      exact: true,
    });
    for (const mode of ["fan", "arc", "ribbon"]) {
      await section.getByRole("combobox").selectOption(mode);
      await expect(section.locator('[data-slot="carousel"]')).toHaveScreenshot(
        `${mode}-${width}.png`,
        {
          animations: "disabled",
          maxDiffPixelRatio: 0.01,
          style: "nextjs-portal { visibility: hidden !important; }",
        },
      );
    }
  });
}
