import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/resizable");
  await expect(
    page.locator('[data-slot="resizable-workspace"]').first(),
  ).toHaveAttribute("data-ready", "true");
});
test("resizes with keys and pointer, persists and resets", async ({ page }) => {
  const root = page.locator('[data-slot="resizable-workspace"]').first();
  await root.scrollIntoViewIfNeeded();
  const pane = page.locator("#research-studio-sources");
  const handle = root.getByRole("separator", { name: "Sources", exact: true });
  const before = (await pane.boundingBox())!.width;
  await handle.press("ArrowRight");
  await expect
    .poll(async () => (await pane.boundingBox())!.width)
    .toBeGreaterThan(before);
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 25, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  const resized = (await pane.boundingBox())!.width;
  await page.reload();
  await expect
    .poll(async () => Math.abs((await pane.boundingBox())!.width - resized))
    .toBeLessThan(2);
  await root.getByRole("button", { name: "Reset layout" }).click();
  await expect
    .poll(async () => Math.abs((await pane.boundingBox())!.width - before))
    .toBeLessThan(2);
});

test("collapse and focus preserve drafts and restore reachable controls", async ({
  page,
}) => {
  const root = page.locator('[data-slot="resizable-workspace"]').first();
  const draft = root.getByRole("textbox", { name: "Opportunity statement" });
  await draft.fill("A thought worth keeping");
  await root.getByRole("button", { name: "Hide Sources" }).click();
  await expect(
    root.getByRole("button", { name: "Show Sources" }),
  ).toBeVisible();
  await expect(
    root.getByRole("button", { name: /Customer interviews/ }),
  ).toHaveCount(0);
  await root.getByRole("button", { name: "Show Sources" }).click();
  await root.getByRole("button", { name: "Focus Working draft" }).click();
  await expect(
    root.getByRole("button", { name: "Restore layout" }),
  ).toBeFocused();
  await expect(
    root.getByRole("button", { name: /Customer interviews/ }),
  ).toHaveCount(0);
  const focusedWidth = (await draft.boundingBox())!.width;
  expect(focusedWidth).toBeGreaterThan((await root.boundingBox())!.width * 0.8);
  await root.getByRole("button", { name: "Restore layout" }).click();
  await expect(
    root.getByRole("button", { name: "Focus Working draft" }),
  ).toBeFocused();
  await expect(draft).toHaveValue("A thought worth keeping");
  await expect(
    root.getByRole("button", { name: /Customer interviews/ }),
  ).toBeVisible();
});

test("compact composition retains state and restores desktop proportions", async ({
  page,
}) => {
  const root = page.locator('[data-slot="resizable-workspace"]').first();
  const draft = root.getByRole("textbox", { name: "Opportunity statement" });
  await draft.fill("Keep across breakpoints");
  const before = (await page.locator("#research-studio-draft").boundingBox())!
    .width;
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root).toHaveAttribute("data-compact", "true");
  await expect(draft).toHaveValue("Keep across breakpoints");
  expect(
    await root.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  await expect(
    root.getByRole("button", { name: "Hide Sources" }),
  ).toBeDisabled();
  await root.getByRole("button", { name: "Focus Working draft" }).click();
  expect((await root.boundingBox())!.height).toBeLessThan(500);
  await expect(draft).toHaveValue("Keep across breakpoints");
  await root.getByRole("button", { name: "Restore layout" }).click();
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(root).not.toHaveAttribute("data-compact");
  await expect
    .poll(async () =>
      Math.abs(
        (await page.locator("#research-studio-draft").boundingBox())!.width -
          before,
      ),
    )
    .toBeLessThan(2);
});

test("nested groups, content controls and accessibility", async ({ page }) => {
  const root = page.locator('[data-slot="resizable-workspace"]').nth(1);
  await root.getByRole("textbox", { name: "Find a workflow" }).fill("Invoice");
  await root.getByRole("button", { name: /Invoice reconciliation/ }).click();
  await root.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    root.getByText("Execution paused by operator", { exact: false }),
  ).toBeVisible();
  const separator = root.getByRole("separator", { name: "Execution overview" });
  await expect(separator).toHaveAttribute("aria-orientation", "horizontal");
  await separator.press("ArrowDown");
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-slot="resizable-workspace"]')
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("storage errors and corrupt snapshots do not prevent interaction", async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem(
      "dethink-research-layout-v1",
      '{"version":1,"layout":{"bad":100}}',
    ),
  );
  await page.reload();
  const root = page.locator('[data-slot="resizable-workspace"]').first();
  await root
    .getByRole("separator", { name: "Sources", exact: true })
    .press("ArrowRight");
  await expect(root.getByRole("textbox")).toBeVisible();
});

test("collapsed panes remain usable in compact mode and restore on desktop", async ({
  page,
}) => {
  const root = page.locator('[data-slot="resizable-workspace"]').first();
  await root.getByRole("button", { name: "Hide Sources" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root).toHaveAttribute("data-compact", "true");
  await expect(
    root.getByRole("button", { name: /Customer interviews/ }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(root).not.toHaveAttribute("data-compact");
  await expect(
    root.getByRole("button", { name: "Show Sources" }),
  ).toBeVisible();
});

test("RTL drag moves the divider in the pointer direction", async ({
  page,
}) => {
  await page.evaluate(() => (document.documentElement.dir = "rtl"));
  const root = page.locator('[data-slot="resizable-workspace"]').first();
  const handle = root.getByRole("separator", { name: "Sources", exact: true });
  await handle.scrollIntoViewIfNeeded();
  const before = (await handle.boundingBox())!;
  await page.mouse.move(before.x, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(before.x - 30, before.y + before.height / 2, {
    steps: 6,
  });
  await page.mouse.up();
  await expect
    .poll(async () => (await handle.boundingBox())!.x)
    .toBeLessThan(before.x - 20);
});

test("touch resizing cancels cleanly and high contrast keeps semantics", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    viewport: { width: 1280, height: 900 },
    forcedColors: "active",
  });
  const page = await context.newPage();
  await page.goto("/components/resizable");
  const handle = page
    .locator('[data-slot="resizable-workspace"]')
    .first()
    .getByRole("separator", { name: "Sources", exact: true });
  await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const point = { x: box.x, y: box.y + box.height / 2 };
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ ...point, x: point.x + 35 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () => (await handle.boundingBox())!.x)
    .toBeGreaterThan(box.x + 20);
  await handle.press("ArrowRight");
  await expect(handle).toBeFocused();
  await expect(handle).toHaveAttribute(
    "aria-controls",
    "research-studio-sources",
  );
  await expect(handle).not.toHaveAttribute("data-separator", "active");
  const next = (await handle.boundingBox())!;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: next.x, y: next.y + next.height / 2 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  await expect(handle).not.toHaveAttribute("data-separator", "active");
  await context.close();
});

test("blocked storage still permits reset and focus", async ({ page }) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "dethink-research-layout-v1")
        throw new Error("Storage blocked");
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "dethink-research-layout-v1")
        throw new Error("Storage blocked");
      set.call(this, key, value);
    };
  });
  await page.reload();
  const root = page.locator('[data-slot="resizable-workspace"]').first();
  await root.getByRole("button", { name: "Reset layout" }).click();
  await root.getByRole("button", { name: "Focus Working draft" }).click();
  await root.getByRole("button", { name: "Restore layout" }).click();
  await expect(root.getByRole("textbox")).toBeVisible();
});

test("chat and canvas preserve messages and edits across resizing and mobile", async ({
  page,
}, testInfo) => {
  const root = page.locator('[data-slot="resizable-workspace"]').nth(2);
  await expect(root).toHaveAttribute("data-ready", "true");
  await expect(root.locator('[data-slot="chat"]')).toHaveAttribute(
    "data-hydrated",
    "true",
  );
  const brief = root.getByRole("textbox", { name: "The next chapter of work" });
  await brief.fill("Our customer pilot starts Monday.");
  await root
    .getByRole("button", { name: "Ask for a launch checklist" })
    .click();
  await root.getByRole("button", { name: "Send message" }).click();
  await expect(
    root.getByRole("group", { name: "Launch checklist" }),
  ).toBeVisible();
  await root.getByRole("checkbox", { name: "Invite the pilot team" }).check();
  const handle = root.getByRole("separator", { name: "Chat", exact: true });
  const pane = page.locator("#chat-studio-canvas");
  const before = (await pane.boundingBox())!.width;
  await handle.press("ArrowLeft");
  await expect
    .poll(async () => (await pane.boundingBox())!.width)
    .toBeGreaterThan(before);
  await expect(brief).toHaveValue("Our customer pilot starts Monday.");
  await root.screenshot({
    path: testInfo.outputPath("chat-canvas-desktop.png"),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root).toHaveAttribute("data-compact", "true");
  await expect(
    root.getByRole("checkbox", { name: "Invite the pilot team" }),
  ).toBeChecked();
  await root
    .getByRole("textbox", { name: "Message the launch assistant" })
    .fill("Keep the pilot small");
  await root.getByRole("button", { name: "Send message" }).click();
  await expect(
    root.getByText("Keep the pilot small", { exact: true }),
  ).toHaveCount(2);
  expect(
    await root.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-slot="resizable-workspace"]')
        .analyze()
    ).violations,
  ).toEqual([]);
  await root.screenshot({
    path: testInfo.outputPath("chat-canvas-mobile.png"),
  });
});

for (const theme of ["light", "dark"] as const)
  test(`workspace ${theme} visual`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.reload();
    const root = page.locator('[data-slot="resizable-workspace"]').first();
    await root.screenshot({
      path: testInfo.outputPath(`workspace-${theme}.png`),
    });
  });
