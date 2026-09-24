import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const route = "/recipes/beacon-landing";
const surface = '[data-recipe-surface="beacon-landing"]';
const stage = "[data-beacon-stage]";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("dethink-theme", "light"),
  );
});

async function centreStep(page: Page, index: number) {
  await page
    .locator(`#beacon-assemble li[data-step="${index}"]`)
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      window.scrollTo({
        top:
          window.scrollY +
          rect.top +
          rect.height / 2 -
          window.innerHeight * 0.55,
        behavior: "instant",
      });
    });
}

test("Beacon is discoverable with source and a correctly sized thumbnail", async ({
  page,
  request,
}) => {
  await page.goto("/recipes");
  await page.getByRole("searchbox", { name: "Search recipes" }).fill("Beacon");
  await page
    .getByRole("list", { name: "Recipe results" })
    .getByRole("link", { name: "Beacon incident-response landing" })
    .click();
  await expect(page).toHaveURL(/\/recipes\/beacon-landing$/);
  await expect(
    page.locator(surface).getByRole("heading", { level: 1 }),
  ).toContainText("Calm incident response");
  await expect(page.locator("pre")).toContainText(
    "export function BeaconLandingRecipe",
  );

  const thumbnail = await request.get(
    "/recipe-captures/beacon-landing--teal-light-default@1x.png",
  );
  expect(thumbnail.ok()).toBe(true);
  const image = await thumbnail.body();
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(675);
});

test("the stage assembles in step with the story and stays decorative", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route, { waitUntil: "networkidle" });

  const story = page.getByRole("list", { name: "How Beacon comes together" });
  await expect(story.locator(":scope > li")).toHaveCount(7);
  await expect(page.locator(stage)).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(stage)).toHaveAttribute("inert", "");

  const expected = [
    "shell",
    "navigation",
    "data",
    "feedback",
    "command",
    "ai",
    "ship",
  ];
  for (const [index, key] of expected.entries()) {
    await centreStep(page, index);
    await expect(page.locator(stage)).toHaveAttribute("data-step", key);
    await expect(story.locator(":scope > li").nth(index)).toHaveAttribute(
      "aria-current",
      "step",
    );
  }

  // Reduced motion sorts instantly and shows the full copilot reply.
  await expect(page.locator(stage)).toContainText("Sorted · severity ↓");
  await expect(page.locator(stage)).toContainText(
    "I drafted the status update.",
  );
  expect(errors).toEqual([]);
});

test("hero incident replay advances, pauses and replays", async ({ page }) => {
  await page.goto(route);
  const replay = page.getByRole("region", { name: "INC-2048" });
  const badge = replay.locator('[data-slot="badge"]').first();

  await expect(badge).toHaveText("Triggered");
  await expect(badge).toHaveText("Acknowledged", { timeout: 5_000 });

  await replay.getByRole("button", { name: "Pause incident replay" }).click();
  const paused = await badge.textContent();
  await page.waitForTimeout(3_000);
  await expect(badge).toHaveText(paused ?? "");

  await replay
    .getByRole("button", { name: "Replay incident from the start" })
    .click();
  await expect(badge).toHaveText("Triggered");
  await expect(
    replay.getByRole("button", { name: "Pause incident replay" }),
  ).toBeVisible();
});

test("reduced motion starts the replay paused on the resolved state", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route, { waitUntil: "networkidle" });
  const replay = page.getByRole("region", { name: "INC-2048" });

  await expect(replay.locator('[data-slot="badge"]').first()).toHaveText(
    "Resolved",
  );
  await expect(
    replay.getByRole("button", { name: "Play incident replay" }),
  ).toBeVisible();
  await expect(
    replay
      .getByRole("list", { name: "INC-2048 activity" })
      .getByRole("listitem"),
  ).toHaveCount(5);
});

test("pricing toggles between annual and monthly", async ({ page }) => {
  await page.goto(route);
  const pricing = page.locator("#beacon-pricing");
  const billing = pricing.getByRole("switch", { name: /Monthly.*Annual/ });

  await expect(billing).toBeChecked();
  await expect(pricing).toContainText("$19");
  await billing.click();
  await expect(billing).not.toBeChecked();
  await expect(pricing).toContainText("$24");
});

test("trial sign-up validates the email and confirms locally", async ({
  page,
}) => {
  await page.goto(route);
  const form = page.getByRole("form", { name: "Start a free trial" });
  const email = form.getByRole("textbox", { name: "Work email" });

  await form.getByRole("button", { name: "Start free trial" }).click();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(form).toContainText("Enter a work email like you@company.com.");
  await expect(email).toBeFocused();

  await email.fill("sam@acme.dev");
  await form.getByRole("button", { name: "Start free trial" }).click();
  await expect(
    page.getByText("Your trial is ready", { exact: true }),
  ).toBeVisible();
  await expect(email).toHaveValue("");
});

test("Beacon passes automated accessibility checks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route, { waitUntil: "networkidle" });
  expect(
    (
      await new AxeBuilder({ page })
        .include(surface)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
