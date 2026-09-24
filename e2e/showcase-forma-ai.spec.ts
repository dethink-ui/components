import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const surface = '[data-recipe-surface="forma-ai"]';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("dethink-theme", "light"),
  );
});
test("gallery links to Forma and exposes source and thumbnail", async ({
  page,
  request,
}) => {
  await page.goto("/recipes");
  await page.getByRole("searchbox", { name: "Search recipes" }).fill("Forma");
  await page
    .getByRole("list", { name: "Recipe results" })
    .getByRole("link", { name: "Forma AI agents studio" })
    .click();
  await expect(
    page.locator(surface).getByRole("heading", { level: 1 }),
  ).toHaveAccessibleName("Less busywork. More possibility.");
  await expect(page.locator("pre")).toContainText(
    "export function FormaAiRecipe",
  );
  const r = await request.get(
    "/recipe-captures/forma-ai--teal-light-default@1x.png",
  );
  expect(r.ok()).toBe(true);
  const image = await r.body();
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(675);
});
for (const name of ["Research", "Support", "Operations"])
  test(`${name} runs through explicit human review`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/recipes/forma-ai");
    const lab = page.getByRole("region", { name: "Interactive agent lab" });
    await lab.getByRole("tab", { name, exact: true }).click();
    await expect(
      lab.getByRole("button", { name: "Review output" }),
    ).toBeDisabled();
    await lab.getByRole("button", { name: "Run sample", exact: true }).click();
    await expect(
      lab.getByRole("button", { name: "Review output" }),
    ).toBeEnabled();
    await lab.getByRole("button", { name: "Review output" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Approve sample output" })
      .click();
    await expect(lab.locator("[data-forma-run-status]")).toContainText(
      "Approved",
    );
    await expect(lab.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    await lab.getByRole("button", { name: "Reset sample" }).click();
    await expect(lab.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(errors).toEqual([]);
  });
test("switching scenario cancels a pending run", async ({ page }) => {
  await page.goto("/recipes/forma-ai");
  await page.getByRole("button", { name: "Run sample", exact: true }).click();
  await page.getByRole("tab", { name: "Support", exact: true }).click();
  await page.waitForTimeout(2200);
  await expect(
    page.getByRole("button", { name: "Review output" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Run sample", exact: true }),
  ).toBeEnabled();
});
test("specialists, scope and validated brief work with local-only submission", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(r.url());
  });
  await page.goto("/recipes/forma-ai");
  await page.getByRole("radio", { name: "Support agent", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("region", { name: "Selected agent details" }),
  ).toContainText("A little more human, at scale.");
  await page.getByRole("tab", { name: "Partner", exact: true }).click();
  const trigger = page
    .getByRole("tabpanel", { name: "Partner", exact: true })
    .getByRole("button");
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "Partner Engagement" }),
  ).toContainText("Partner");
  await dialog.getByRole("button", { name: "Prepare sample brief" }).click();
  await expect(
    dialog.getByRole("textbox", { name: "Your name" }),
  ).toBeFocused();
  await dialog.getByRole("textbox", { name: "Your name" }).fill("Alex Morgan");
  await dialog
    .getByRole("textbox", { name: "Work email" })
    .fill("alex@example.com");
  await dialog
    .getByRole("textbox", { name: "What would you like to change?" })
    .fill("Make our team onboarding workflow easier to manage.");
  await dialog.getByRole("button", { name: "Prepare sample brief" }).click();
  await expect(
    dialog.getByRole("heading", {
      name: "Your sample brief is ready, Alex Morgan.",
    }),
  ).toBeFocused();
  await expect(dialog).toContainText("No email sent");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog.getByRole("textbox", { name: "Your name" })).toBeEmpty();
  expect(posts).toEqual([]);
});
test("integration preview and FAQ respond and restore focus", async ({
  page,
}) => {
  await page.goto("/recipes/forma-ai");
  const trigger = page.getByRole("button", {
    name: "Explore Knowledge integration",
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText("Knowledge");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  const faq = page.getByRole("button", { name: "What does Forma build?" });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
});
test("motion can be paused and responds to reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/recipes/forma-ai");
  await expect(page.locator(surface)).toHaveAttribute("data-motion", "playing");
  await page.getByRole("button", { name: "Pause animation" }).click();
  await expect(page.locator(surface)).toHaveAttribute("data-motion", "paused");
  await page.getByRole("button", { name: "Resume animation" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(surface)).toHaveAttribute("data-motion", "paused");
});
for (const width of [390, 768, 1440])
  test(`fits viewport ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/recipes/forma-ai");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.locator(surface).getByRole("heading", { level: 1 }),
    ).toBeVisible();
  });
for (const theme of ["light", "dark"])
  test(`accessible ${theme} page and brief`, async ({ page }) => {
    await page.goto("/recipes/forma-ai");
    await page
      .getByRole("button", {
        name: theme === "dark" ? "Dark theme" : "Light theme",
        exact: true,
      })
      .click();
    await expect
      .poll(
        async () =>
          (await new AxeBuilder({ page }).include(surface).analyze())
            .violations,
      )
      .toEqual([]);
    await page
      .getByRole("button", { name: "Build with us", exact: true })
      .click();
    await expect
      .poll(
        async () =>
          (await new AxeBuilder({ page }).include('[role="dialog"]').analyze())
            .violations,
      )
      .toEqual([]);
  });
