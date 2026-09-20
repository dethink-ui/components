import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const landing = '[data-recipe-surface="automation-landing"]';
const login = '[data-recipe-surface="automation-login"]';

test("both shaders run with motion and release their canvas for reduced motion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const slug of ["automation-landing", "automation-login"]) {
    await page.goto(`/recipes/${slug}`);
    const shader = page.locator(
      `[data-recipe-surface="${slug}"] [data-effect]`,
    );
    await expect(shader).toHaveAttribute("data-state", "running");
    await expect(shader.locator("canvas")).toHaveCount(1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(shader).toHaveAttribute("data-state", "static");
    await expect(shader.locator("canvas")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
  expect(errors).toEqual([]);
});

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() =>
    localStorage.setItem("dethink-theme", "light"),
  );
});

test("flowing background pixels change and the headline particles follow the pointer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/recipes/automation-landing");
  const root = page.locator(landing);
  const background = root.locator('[data-effect="silk-flow"]');
  await expect(background).toHaveAttribute("data-state", "running");
  const canvas = background.locator("canvas");
  const first = await canvas.screenshot();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(first))
    .toBe(false);
  const headline = root.locator('[data-animation="particle-follow"]').first();
  await expect(headline).toHaveAttribute("data-state", "formed");
  const bounds = (await headline.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.35,
    bounds.y + bounds.height * 0.5,
    { steps: 10 },
  );
  await expect(headline).toHaveAttribute("data-state", "following");
  await page.mouse.move(bounds.x - 15, bounds.y - 15);
  await expect(headline).toHaveAttribute("data-state", "formed");
  await expect(root.getByRole("heading", { level: 1 })).toContainText(
    "Less busywork.",
  );
});

test("gallery, source, thumbnails and landing-to-login journey", async ({
  page,
  request,
}) => {
  await page.goto("/recipes");
  await page
    .getByRole("searchbox", { name: "Search recipes" })
    .fill("Automation");
  const results = page.getByRole("list", { name: "Recipe results" });
  await results
    .getByRole("link", { name: "Automation software landing" })
    .click();
  await expect(
    page.locator(landing).getByRole("heading", { level: 1 }),
  ).toContainText("Less busywork.");
  await page.getByRole("link", { name: "Source", exact: true }).click();
  await expect(page.locator("pre")).toContainText(
    "export function AutomationLandingRecipe",
  );
  await page
    .locator(landing)
    .getByRole("link", { name: "Start automating" })
    .click();
  await expect(page).toHaveURL(/\/recipes\/automation-login$/);
  await expect(
    page.locator(login).getByRole("heading", { level: 1 }),
  ).toHaveText("Welcome back.");
  await page.getByRole("link", { name: "Source", exact: true }).click();
  await expect(page.locator("pre")).toContainText(
    "export function AutomationLoginRecipe",
  );
  for (const slug of ["automation-landing", "automation-login"]) {
    const response = await request.get(
      `/recipe-captures/${slug}--teal-light-default@1x.png`,
    );
    expect(response.ok()).toBeTruthy();
    const bytes = await response.body();
    expect(bytes.readUInt32BE(16)).toBe(1200);
    expect(bytes.readUInt32BE(20)).toBe(675);
  }
});

test("workflows run repeatedly, cancel on tab change, pricing and FAQ work", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/recipes/automation-landing");
  const root = page.locator(landing);
  await root.getByRole("tab", { name: "Lead routing" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    root.getByRole("tab", { name: "Invoice approvals" }),
  ).toHaveAttribute("aria-selected", "true");
  await root.getByRole("button", { name: "Run sample", exact: true }).click();
  await expect(root.getByRole("status")).toContainText(
    "Invoice approvals complete",
  );
  await expect(root.getByRole("row", { name: /Sample run 1/ })).toContainText(
    "Approved",
  );
  await root.getByRole("button", { name: "Run sample", exact: true }).click();
  await expect(root.getByRole("status")).toContainText("Sample run 2 added");
  await root.getByRole("button", { name: "Run sample", exact: true }).click();
  await root.getByRole("tab", { name: "Incident response" }).click();
  await expect(root.getByRole("status")).toContainText("Ready when you are");
  await root.getByRole("button", { name: "Run sample", exact: true }).click();
  await expect(root.getByRole("status")).toContainText(
    "Incident response complete. Sample run 1",
  );
  await expect(root.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await root.getByRole("button", { name: "Monthly", exact: true }).click();
  await expect(root.locator('[data-plan-price="Team"]')).toHaveText("$30");
  await root.getByRole("button", { name: "Yearly · save 20%" }).click();
  await expect(root.locator('[data-plan-price="Team"]')).toHaveText("$24");
  await root
    .getByRole("button", { name: "Is this a real software service?" })
    .click();
  await expect(
    root.getByText(/Automation is a fictional company/),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

for (const provider of ["Google", "GitHub"]) {
  test(`${provider} has pending, failure, retry and focused completion`, async ({
    page,
  }) => {
    await page.goto("/recipes/automation-login");
    const root = page.locator(login);
    await root.getByText("About this sign-in demo", { exact: true }).click();
    await root.getByRole("checkbox").check();
    await root
      .getByRole("button", { name: `Continue with ${provider}` })
      .click();
    await expect(root.getByRole("status")).toContainText(
      `Previewing ${provider}`,
    );
    await expect(
      root.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeDisabled();
    await expect(root.getByRole("alert")).toContainText("simulated error");
    await root.getByRole("button", { name: `Retry ${provider} demo` }).click();
    await expect(
      root.getByRole("heading", { name: "You’re ready to explore." }),
    ).toBeFocused();
    await expect(root).toContainText(`${provider} sign-in demo complete`);
    await root
      .getByRole("button", { name: "Try another sign-in method" })
      .click();
    await expect(root.getByLabel("Password", { exact: true })).toBeEmpty();
  });
}

test("email validation, password visibility and local recovery", async ({
  page,
}) => {
  await page.goto("/recipes/automation-login");
  const root = page.locator(login);
  await root.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(root.getByText("Enter a valid email address.")).toBeVisible();
  await expect(root.getByLabel("Email", { exact: true })).toBeFocused();
  await root.getByLabel("Email", { exact: true }).fill("sample@example.com");
  await root.getByLabel("Password", { exact: true }).fill("sample-only");
  await root.getByRole("button", { name: "Show password" }).click();
  await expect(root.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await root.getByRole("button", { name: "Hide password" }).click();
  const recovery = root.getByRole("button", { name: "Forgot your password?" });
  await recovery.click();
  const dialog = page.getByRole("dialog", { name: "Let’s get you back in." });
  await dialog.getByLabel("Email", { exact: true }).fill("sample@example.com");
  await dialog.getByRole("button", { name: "Preview recovery" }).click();
  await expect(dialog.getByRole("status")).toContainText(
    "Recovery preview complete",
  );
  await page.keyboard.press("Escape");
  await expect(recovery).toBeFocused();
  const requests: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT"].includes(request.method()))
      requests.push(request.url());
  });
  await root.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    root.getByRole("heading", { name: "You’re ready to explore." }),
  ).toBeFocused();
  expect(requests).toEqual([]);
  await root.getByRole("link", { name: "Explore the workflows" }).click();
  await expect(page).toHaveURL(/\/recipes\/automation-landing$/);
});

for (const theme of ["light", "dark"]) {
  for (const slug of ["automation-landing", "automation-login"]) {
    test(`${slug}: ${theme} desktop and mobile accessibility and reflow`, async ({
      page,
    }) => {
      await page.goto(`/recipes/${slug}`);
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(
          page
            .locator(`[data-recipe-surface="${slug}"]`)
            .getByRole("heading", { level: 1 }),
        ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBeTruthy();
      }
      const results = await new AxeBuilder({ page })
        .include(`[data-recipe-surface="${slug}"]`)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      await page.emulateMedia({ forcedColors: "active" });
      await expect(
        page
          .locator(`[data-recipe-surface="${slug}"]`)
          .getByRole("heading", { level: 1 }),
      ).toBeVisible();
      await expect(
        page.locator(`[data-recipe-surface="${slug}"] canvas`),
      ).toHaveCount(0);
    });
  }
}

test("WebGL unavailable keeps the hero and workflow usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      kind: string,
      ...args: unknown[]
    ) {
      if (kind === "webgl" || kind === "webgl2") return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto("/recipes/automation-landing");
  await expect(
    page.locator(landing).getByRole("heading", { level: 1 }),
  ).toContainText("More momentum.");
  await page
    .locator(landing)
    .getByRole("button", { name: "Run sample", exact: true })
    .click();
  await expect(page.locator(landing).getByRole("status")).toContainText(
    "Lead routing complete",
  );
});
