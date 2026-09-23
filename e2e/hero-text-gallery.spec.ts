import { expect, test } from "@playwright/test";

test("blur reveals from soft focus and scroll motion stays visible and stable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/components/hero-text-animation");
  const blur = page.locator(
    "#hero-text-blur-focus-heading [data-slot=hero-text-animation-motion]",
  );
  await expect(blur).toHaveCSS("filter", /blur\((?!0px)/);
  await blur.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      blur.evaluate((node) => parseFloat(getComputedStyle(node).opacity)),
    )
    .toBeGreaterThan(0.5);
  // Opacity resolves before focus; the intermediate image must still be blurred.
  expect(
    await blur.evaluate((node) =>
      parseFloat(getComputedStyle(node).filter.replace("blur(", "")),
    ),
  ).toBeGreaterThan(0);
  await expect(blur).toHaveCSS("filter", "blur(0px)");

  const heading = page.locator("#hero-text-scroll-responsive-heading");
  const visual = heading.locator("[data-slot=hero-text-animation-motion]");
  await heading.evaluate((node) => {
    window.scrollTo({
      top:
        window.scrollY +
        node.getBoundingClientRect().top -
        window.innerHeight * 0.7,
      behavior: "instant",
    });
  });
  await expect
    .poll(() => visual.getAttribute("data-scroll-progress"))
    .toBe("0.000");
  await page.evaluate(() =>
    window.scrollBy({ top: window.innerHeight * 0.275, behavior: "instant" }),
  );
  await expect
    .poll(async () => Number(await visual.getAttribute("data-scroll-progress")))
    .toBeCloseTo(0.5, 1);
  await expect(heading).toBeInViewport({ ratio: 1 });
  await expect(visual).toHaveAttribute("data-scroll-scale", "0.950");
  const label = heading.locator("..").locator("p").first();
  const gap = await visual.evaluate((node) => {
    const label = node.closest("h2").previousElementSibling;
    return (
      node.getBoundingClientRect().top - label.getBoundingClientRect().bottom
    );
  });
  expect(gap).toBeGreaterThanOrEqual(24);
  await expect(label).toBeVisible();
  const progress = await visual.getAttribute("data-scroll-progress");
  await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
  await page.waitForTimeout(100);
  expect(await visual.getAttribute("data-scroll-progress")).toBe(progress);
  await page.mouse.move(700, 500);
  await page.mouse.wheel(0, -150);
  await expect
    .poll(async () => Number(await visual.getAttribute("data-scroll-scale")))
    .toBeGreaterThan(0.97);
  await page.mouse.wheel(0, 300);
  await expect
    .poll(async () => Number(await visual.getAttribute("data-scroll-scale")))
    .toBeLessThan(0.94);
});

test("all hero layouts fit narrow and wide containers with readable reduced-motion headings", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/hero-text-animation");
  const heroes = page.locator("[data-hero-preview]");
  await expect(heroes).toHaveCount(14);
  await expect(
    heroes.first().locator("[data-slot=hero-text-animation]"),
  ).toHaveAttribute("data-reduced-motion", "true");
  for (const width of [320, 390, 768, 1024, 1280, 1600]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(
        () =>
          heroes.evaluateAll((elements) =>
            elements.flatMap((hero) =>
              Array.from(hero.querySelectorAll<HTMLElement>("*"))
                .filter(
                  (node) =>
                    node.clientWidth > 0 &&
                    node.scrollWidth > node.clientWidth + 2 &&
                    !node.closest("svg") &&
                    getComputedStyle(node).overflowX === "visible",
                )
                .map(
                  (node) =>
                    `${hero.getAttribute("data-hero-preview")}: ${node.tagName} ${node.textContent?.slice(0, 40)}`,
                ),
            ),
          ),
        { message: `No overflowing hero content at ${width}px` },
      )
      .toEqual([]);
  }
  for (const hero of await heroes.all()) {
    const heading = hero.locator("[data-slot=hero-text-animation]");
    await expect(heading).toHaveAttribute("data-reduced-motion", "true");
    await expect(
      heading.locator("[data-slot=hero-text-animation-accessible-text]"),
    ).not.toBeEmpty();
    await expect(heading).toHaveAttribute("data-repeat", "false");
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(
    heroes.first().locator("[data-slot=hero-text-animation]"),
  ).toHaveAttribute("data-reduced-motion", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    heroes.first().locator("[data-slot=hero-text-animation]"),
  ).toHaveAttribute("data-reduced-motion", "true");
});

test("every reveal completes after entering view, and replay preserves keyboard focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/components/hero-text-animation");
  for (const hero of await page.locator("[data-hero-preview]").all()) {
    const heading = hero.locator("[data-slot=hero-text-animation]");
    await heading.scrollIntoViewIfNeeded();
    // No word/phrase may remain hidden once its entrance finishes.
    await expect
      .poll(
        () =>
          heading
            .locator("[data-slot=hero-text-animation-visual]")
            .evaluate(
              (visual) =>
                Array.from(
                  visual.querySelectorAll<HTMLElement>("[style]"),
                ).filter(
                  (node) =>
                    node.style.opacity === "0" &&
                    getComputedStyle(node).visibility !== "hidden",
                ).length,
            ),
        { timeout: 7000 },
      )
      .toBe(0);
    await expect(heading).toHaveAttribute("data-trigger", "in-view");
  }
  const typewriter = page.locator('[data-hero-preview="Typewriter Hero"]');
  const replay = typewriter.getByRole("button", {
    name: "Replay Typewriter Hero",
  });
  await replay.scrollIntoViewIfNeeded();
  await replay.focus();
  await replay.press("Enter");
  await expect(replay).toBeFocused();
  const heading = typewriter.locator("[data-slot=hero-text-animation]");
  await heading.scrollIntoViewIfNeeded();
  await expect(
    heading.locator("[data-slot=hero-text-animation-typewriter-text]"),
  ).toHaveText("Ship your CLI in an afternoon.");
});
