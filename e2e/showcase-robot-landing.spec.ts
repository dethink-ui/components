import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
const surface = '[data-recipe-surface="robot-landing"]';
const url = "/recipes/robot-landing";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("dethink-theme", "light"),
  );
});
async function scrollTeardown(page: Page, fraction: number) {
  await page.evaluate((value) => {
    const section = document.getElementById("robot-teardown")!;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    window.scrollTo(0, top + travel * value);
  }, fraction);
}
const headTransform = (page: Page) =>
  page
    .locator('[data-robot-part="head"]')
    .evaluate((el) => getComputedStyle(el).transform);
test("gallery links to the recipe and exposes source and thumbnail", async ({
  page,
  request,
}) => {
  await page.goto("/recipes");
  await page.getByRole("searchbox", { name: "Search recipes" }).fill("Ollo");
  await page
    .getByRole("list", { name: "Recipe results" })
    .getByRole("link", { name: "Ollo modular robot landing" })
    .click();
  await expect(
    page.locator(surface).getByRole("heading", { level: 1 }),
  ).toHaveAccessibleName("Meet Ollo. The helper you can take apart.");
  await expect(page.locator("pre").last()).toContainText(
    "export function RobotLandingRecipe",
  );
  const r = await request.get(
    "/recipe-captures/robot-landing--teal-light-default@1x.png",
  );
  expect(r.ok()).toBe(true);
  const image = await r.body();
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(675);
  for (const part of ["head", "torso", "arm-left", "leg-right", "robot"]) {
    expect(
      (await request.get(`/recipes/robot-landing/layer-${part}.webp`)).ok(),
    ).toBe(true);
  }
});
test("scrolling the teardown detaches parts and advances features", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  const section = page.locator("#robot-teardown");
  await scrollTeardown(page, 0);
  await expect(section).toHaveAttribute("data-robot-step", "0");
  const assembled = await headTransform(page);
  await scrollTeardown(page, 0.35);
  await expect(section).toHaveAttribute("data-robot-step", "2");
  await expect(section).toContainText("Gentle enough for glassware.");
  await scrollTeardown(page, 0.95);
  await expect(section).toHaveAttribute("data-robot-step", "5");
  await expect(section.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await expect.poll(() => headTransform(page)).not.toBe(assembled);
  for (const callout of ["Vision head", "Hands", "Core", "Legs"]) {
    await expect(
      section.locator(`[data-robot-callout="${callout}"]`),
    ).toHaveCSS("opacity", "1");
  }
  expect(errors).toEqual([]);
});
test("step navigation jumps to a part with the keyboard", async ({ page }) => {
  await page.goto(url, { waitUntil: "networkidle" });
  await scrollTeardown(page, 0.02);
  const nav = page.getByRole("navigation", { name: "Teardown steps" });
  await nav.getByRole("button", { name: "Legs" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#robot-teardown")).toHaveAttribute(
    "data-robot-step",
    "4",
  );
  await expect(nav.getByRole("button", { name: "Legs" })).toHaveAttribute(
    "aria-current",
    "step",
  );
});
test("reduced motion swaps between still states without scrubbing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "networkidle" });
  await scrollTeardown(page, 0);
  const assembled = await headTransform(page);
  await scrollTeardown(page, 0.3);
  await expect(page.locator("#robot-teardown")).toHaveAttribute(
    "data-robot-step",
    "2",
  );
  await expect.poll(() => headTransform(page)).not.toBe(assembled);
  const exploded = await headTransform(page);
  await expect
    .poll(() =>
      page
        .locator('[data-robot-callout="Legs"]')
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeGreaterThan(0.5);
  await scrollTeardown(page, 0.6);
  await expect(page.locator("#robot-teardown")).toHaveAttribute(
    "data-robot-step",
    "3",
  );
  expect(await headTransform(page)).toBe(exploded);
});
test("configurator updates finish, total, and reservation", async ({
  page,
}) => {
  await page.goto(url, { waitUntil: "networkidle" });
  const reserve = page.locator("#robot-reserve");
  await expect(reserve.locator("[data-robot-total]")).toHaveText("$2,680");
  await reserve.getByRole("checkbox", { name: /Workshop hands/ }).click();
  await expect(reserve.locator("[data-robot-total]")).toHaveText("$2,970");
  await reserve.getByRole("radio", { name: "Ocean" }).check();
  await expect(reserve).toHaveAttribute("data-finish", "ocean");
  await expect(
    reserve.getByRole("img", { name: "Ollo in the Ocean finish" }),
  ).toBeVisible();
  await reserve.getByRole("switch", { name: "Ship fully assembled" }).click();
  await reserve.getByRole("button", { name: "Reserve with $99" }).click();
  await expect(reserve).toContainText("Ollo in Ocean, as a kit");
});
test("fits narrow screens without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(url, { waitUntil: "networkidle" });
  for (const fraction of [0, 0.95]) {
    await scrollTeardown(page, fraction);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }
});
for (const theme of ["light", "dark"] as const)
  test(`has no axe violations in ${theme} mode`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("dethink-theme", value),
      theme,
    );
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const results = await new AxeBuilder({ page }).include(surface).analyze();
    expect(results.violations).toEqual([]);
  });
