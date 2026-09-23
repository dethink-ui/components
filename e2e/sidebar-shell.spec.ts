import { expect, test, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function box(locator: Locator) {
  const value = await locator.boundingBox();
  expect(value).not.toBeNull();
  return value!;
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title === "activity actions and empty state") {
    await page.goto("/components/sidebar-activity");
    return;
  }
  await page.goto("/components/sidebar-shell");
  const demo = page.getByTestId("shell-layout-demo");
  await demo.scrollIntoViewIfNeeded();
  await demo.getByLabel("Bottom bar").selectOption("shell");
  await demo.getByLabel("Appearance").selectOption("plain");
  await expect(demo.locator('[data-slot="sidebar-shell"]')).toHaveAttribute(
    "data-chrome",
    "plain",
  );
  await demo.getByLabel("Appearance").selectOption("workbench");
  await expect(demo.locator('[data-slot="sidebar-shell"]')).toHaveAttribute(
    "data-chrome",
    "workbench",
  );
});

for (const side of ["left", "right"]) {
  for (const dir of ["ltr", "rtl"]) {
    test(`${side} ${dir}: placement, collapse and optional regions`, async ({
      page,
    }) => {
      const demo = page.getByTestId("shell-layout-demo");
      await demo.getByLabel("Navigation side").selectOption(side);
      await demo
        .getByRole("combobox", { name: /^Direction/ })
        .selectOption(dir);
      const nav = demo.getByRole("navigation", {
        name: "Workspace navigation",
      });
      const main = demo.getByRole("region", { name: "Workspace content" });
      const footer = demo.locator('[data-slot="sidebar-shell-footer"]');
      const frame = demo.locator('[data-slot="sidebar-shell-frame"]');
      const navigationBox = await box(nav);
      const frameBox = await box(frame);
      expect(
        side === "left"
          ? navigationBox.x < frameBox.x
          : navigationBox.x > frameBox.x,
      ).toBe(true);
      const barBox = await box(footer);
      expect(barBox.width).toBeGreaterThan(frameBox.width + 200);
      expect(barBox.y).toBeGreaterThanOrEqual(
        navigationBox.y + navigationBox.height,
      );
      const mainBox = await box(main);
      expect(mainBox.height).toBeGreaterThan(300);
      await main.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      expect(await main.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect((await box(footer)).y).toBeCloseTo(barBox.y, 0);
      await demo.getByRole("button", { name: "Save draft" }).click();
      await expect(
        demo.locator('[data-slot="sidebar-shell-footer"]').getByRole("status"),
      ).toHaveText("Draft saved");
      await demo
        .getByRole("button", { name: "Collapse sidebar", exact: true })
        .first()
        .click();
      await expect.poll(async () => (await box(nav)).width).toBeLessThan(100);
      await demo
        .getByRole("button", { name: "Expand sidebar", exact: true })
        .first()
        .click();
      await demo.getByLabel("Bottom bar").selectOption("content");
      expect((await box(footer)).width).toBeCloseTo(
        (await box(frame)).width - 2,
        0,
      );
      await demo.getByLabel("Bottom bar").selectOption("none");
      await demo.getByLabel("Show header").uncheck();
      await expect(footer).toHaveCount(0);
      await expect(
        demo.locator('[data-slot="sidebar-shell-header"]'),
      ).toHaveCount(0);
      expect((await box(main)).height).toBeCloseTo(
        (await box(frame)).height - 2,
        0,
      );
      await demo.getByLabel("Appearance").selectOption("plain");
      expect((await box(main)).height).toBeCloseTo(
        (await box(frame)).height,
        0,
      );
    });
  }
}

test("changing sides preserves form input and provides meaningful keyboard order", async ({
  page,
}) => {
  const demo = page.getByTestId("shell-layout-demo");
  await demo
    .getByRole("textbox", { name: "Search workspace" })
    .fill("Keep my work");
  await demo.getByLabel("Navigation side").selectOption("right");
  await expect(
    demo.getByRole("textbox", { name: "Search workspace" }),
  ).toHaveValue("Keep my work");
  const order = await demo
    .locator('[data-slot="sidebar-shell"]')
    .evaluate((el) =>
      Array.from(el.children).map((child) => child.getAttribute("data-slot")),
    );
  expect(order).toEqual([
    "sidebar-shell-skip-link",
    "sidebar-shell-frame",
    "sidebar",
    "sidebar-shell-footer",
  ]);
  await demo.getByRole("link", { name: "Skip to main content" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    demo.getByRole("region", { name: "Workspace content" }),
  ).toBeFocused();
  const results = await new AxeBuilder({ page })
    .include('[data-testid="shell-layout-demo"]')
    .analyze();
  expect(results.violations).toEqual([]);
});

for (const side of ["left", "right"]) {
  test(`mobile RTL ${side}: drawer edge, focus and bottom actions`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const demo = page.getByTestId("shell-layout-demo");
    await demo.getByLabel("Navigation side").selectOption(side);
    await demo
      .getByRole("combobox", { name: /^Direction/ })
      .selectOption("rtl");
    await demo.getByRole("button", { name: "Open sidebar" }).click();
    const dialog = page.getByRole("dialog", { name: "Workspace navigation" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("dir", "rtl");
    const bounds = await box(dialog);
    const overlay = await box(
      page.locator('[data-slot="sidebar-mobile-overlay"]'),
    );
    expect(
      side === "left"
        ? bounds.x - overlay.x
        : overlay.x + overlay.width - bounds.x - bounds.width,
    ).toBeCloseTo(0, 0);
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(
      demo.getByRole("button", { name: "Open sidebar" }),
    ).toBeFocused();
    const footer = await box(
      demo.locator('[data-slot="sidebar-shell-footer"]'),
    );
    const main = await box(
      demo.getByRole("region", { name: "Workspace content" }),
    );
    expect(footer.y).toBeGreaterThanOrEqual(main.y + main.height);
    expect(await demo.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
    await demo.getByRole("button", { name: "Save draft" }).click();
    await expect(
      demo.locator('[data-slot="sidebar-shell-footer"]').getByRole("status"),
    ).toHaveText("Draft saved");
  });
}

test("layout visual", async ({ page }) => {
  const demo = page.getByTestId("shell-layout-demo");
  await expect(demo).toHaveScreenshot("sidebar-shell-layout.png", {
    animations: "disabled",
  });
});

test("activity summary expands with focus and mobile details survive desktop collapse", async ({
  page,
}) => {
  const demo = page.getByTestId("shell-layout-demo");
  await demo
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .first()
    .click();
  const summary = demo.getByRole("button", { name: /Open activity/ });
  await expect(summary).toHaveAccessibleName(/1 needs attention/);
  await summary.click();
  await expect(
    demo.getByRole("region", { name: "Background work" }),
  ).toBeFocused();
  await demo
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .first()
    .click();
  const a11y = await new AxeBuilder({ page })
    .include('[data-testid="shell-layout-demo"]')
    .analyze();
  expect(a11y.violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await demo.getByRole("button", { name: "Open sidebar" }).click();
  const dialog = page.getByRole("dialog", { name: "Workspace navigation" });
  await expect(
    dialog.getByRole("region", { name: "Background work" }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /Open activity/ }),
  ).toHaveCount(0);
  await dialog.getByRole("button", { name: "Approve brief" }).click();
  await expect(dialog.getByRole("status")).toHaveText("1 running, 1 complete");
  await page.keyboard.press("Escape");
  await expect(
    demo.getByRole("button", { name: "Open sidebar" }),
  ).toBeFocused();
});

test("activity actions and empty state", async ({ page }) => {
  const demo = page.getByTestId("sidebar-activity-demo");
  await demo.getByRole("button", { name: "Approve brief" }).click();
  await expect(demo.getByRole("status")).toHaveText(
    "1 running, 1 complete, 1 queued",
  );
  await demo.getByRole("button", { name: "Finish demo run" }).click();
  await expect(demo.getByRole("progressbar")).toHaveCount(0);
  await demo.getByRole("button", { name: "Clear activity" }).click();
  await expect(demo.getByText("All caught up")).toBeVisible();
  const sidebar = demo.getByRole("navigation", { name: "Activity workspace" });
  const expanded = await box(sidebar);
  const logo = demo.locator('[data-testid="activity-workspace-icon"]');
  const logoBefore = await box(logo);
  await demo
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await expect(
    demo.getByRole("button", { name: "Expand sidebar", exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await box(sidebar)).width).toBeLessThan(100);
  expect((await box(sidebar)).x).toBeCloseTo(expanded.x, 0);
  expect((await box(logo)).x).toBeCloseTo(logoBefore.x, 0);
  await demo
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();
  await expect(demo.getByText("All caught up")).toBeVisible();
});

test("dark and mobile visuals", async ({ page }) => {
  const demo = page.getByTestId("shell-layout-demo");
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await demo.getByLabel("Navigation side").selectOption("right");
  await demo.scrollIntoViewIfNeeded();
  await expect(demo).toHaveScreenshot("sidebar-shell-dark-right.png", {
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(demo).toHaveScreenshot("sidebar-shell-mobile.png", {
    animations: "disabled",
  });
});

test("contained work panel preserves notes and supports keyboard collapse", async ({
  page,
}) => {
  const demo = page.getByTestId("shell-layout-demo");
  await demo.getByLabel("Bottom bar").selectOption("panel");
  const panel = demo.getByRole("region", { name: "Workbench activity" });
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Approve brief" }).click();
  await expect(panel.getByText("Approved", { exact: true })).toBeVisible();
  await demo.getByRole("button", { name: "Notes", exact: true }).click();
  await demo
    .getByLabel("Workspace notes")
    .fill("Follow up on the launch brief");
  const collapse = demo.getByRole("button", { name: "Collapse work panel" });
  await collapse.focus();
  await page.keyboard.press("Enter");
  await expect(demo.getByLabel("Workspace notes")).toBeHidden();
  await demo.getByRole("button", { name: "Expand work panel" }).click();
  await expect(demo.getByLabel("Workspace notes")).toHaveValue(
    "Follow up on the launch brief",
  );
  await demo.getByLabel("Navigation side").selectOption("right");
  await demo
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  const summary = demo.getByRole("button", { name: /^Open activity/ });
  const summaryBox = await box(summary);
  expect(summaryBox.width).toBeCloseTo(summaryBox.height, 0);
  await expect(demo.locator('[data-slot="sidebar-rail"]')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  const shellBox = await box(demo.locator('[data-slot="sidebar-shell"]'));
  const panelBox = await box(
    demo.getByRole("region", { name: "Workbench notes" }),
  );
  expect(panelBox.x).toBeGreaterThanOrEqual(shellBox.x);
  expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(
    shellBox.x + shellBox.width,
  );
  await demo.getByLabel("Bottom bar").selectOption("none");
  await expect(demo.locator('[data-slot="sidebar-shell-footer"]')).toHaveCount(
    0,
  );
});

test("BottomBar sizes, shell span and standalone disclosure", async ({
  page,
}) => {
  const demo = page.getByTestId("shell-layout-demo");
  await demo.getByLabel("Bottom bar").selectOption("panel");
  const content = demo.locator('[data-slot="bottom-bar-content"]');
  const small = await box(content);
  await demo.getByLabel("Panel size").selectOption("lg");
  expect((await box(content)).height).toBeGreaterThan(small.height);
  await demo.getByLabel("Bottom bar").selectOption("panel-shell");
  const bar = demo.locator('[data-slot="bottom-bar"]');
  await expect(
    demo.locator('[data-slot="sidebar-shell"] > [data-slot="bottom-bar"]'),
  ).toBeVisible();
  const barBox = await box(bar);
  const frameBox = await box(demo.locator('[data-slot="sidebar-shell-frame"]'));
  expect(barBox.width).toBeGreaterThan(frameBox.width);
  expect(barBox.height).toBeLessThanOrEqual(440);
  await expect(
    demo.getByRole("region", { name: "Workspace content" }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include('[data-testid="shell-layout-demo"]')
    .analyze();
  expect(results.violations).toEqual([]);
  await demo.getByLabel("Panel size").selectOption("sm");
  await expect(demo).toHaveScreenshot("bottom-bar-shell.png");
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(demo).toHaveScreenshot("bottom-bar-mobile-dark.png");
  await page.goto("/components/bottom-bar");
  const notes = page.getByRole("textbox", { name: "Notes", exact: true });
  await notes.fill("Retained standalone state");
  const trigger = page.getByRole("button", { name: "Collapse bottom bar" });
  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(notes).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(notes).toHaveValue("Retained standalone state");
});

test("large BottomBar preserves main space in a short shell", async ({
  page,
}) => {
  const demo = page.getByTestId("shell-layout-demo");
  for (const placement of ["panel", "panel-shell"]) {
    await demo.getByLabel("Bottom bar").selectOption(placement);
    await demo.getByLabel("Panel size").selectOption("lg");
    await demo.locator('[data-slot="sidebar-shell"]').evaluate((el) => {
      el.style.height = "300px";
    });
    const main = demo.locator('[data-slot="sidebar-shell-main"]');
    const bounds = await box(main);
    const barBounds = await box(demo.locator('[data-slot="bottom-bar"]'));
    expect(bounds.height).toBeGreaterThan(64);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(barBounds.y);
    await expect(
      demo.getByRole("button", { name: "Collapse work panel" }),
    ).toBeVisible();
  }
});
