import { expect, test, type Locator } from "@playwright/test";

async function swipe(target: Locator, dx: number, dy = 0, cancel = false) {
  await target.dispatchEvent("pointerdown", {
    pointerId: 1,
    pointerType: "touch",
    isPrimary: true,
    button: 0,
    clientX: 200,
    clientY: 200,
  });
  await target.dispatchEvent("pointermove", {
    pointerId: 1,
    pointerType: "touch",
    clientX: 200 + dx,
    clientY: 200 + dy,
  });
  await target.dispatchEvent(cancel ? "pointercancel" : "pointerup", {
    pointerId: 1,
    pointerType: "touch",
    clientX: 200 + dx,
    clientY: 200 + dy,
  });
}

test("rapid reversals settle, evidence links work, and gestures are deliberate", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/components/card-stack-animated");
  const stack = page.getByRole("group", {
    name: "Research briefing",
    exact: true,
  });
  await stack.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await expect(stack).toHaveAttribute("data-active-index", "1");
  await expect
    .poll(() =>
      stack
        .locator('[data-slot="card-stack-item"]')
        .evaluateAll((items) =>
          items.every((item) => !(item as HTMLElement).style.transform),
        ),
    )
    .toBe(true);
  await page
    .locator("summary")
    .filter({ hasText: "Evidence notebook" })
    .click();
  await stack.getByRole("link", { name: "Inspect sample evidence" }).click();
  await expect(page.locator("#briefing-evidence-1")).toBeVisible();
  const deck = stack.locator('[data-slot="card-stack-deck"]');
  await swipe(deck, -150, 0, true);
  await swipe(deck, -20);
  await swipe(deck, -30, 150);
  await expect(stack).toHaveAttribute("data-active-index", "1");
  await swipe(deck, -150);
  await expect(stack).toHaveAttribute("data-active-index", "2");
  await stack.evaluate((element) => {
    element.dir = "rtl";
  });
  await swipe(deck, 150);
  await expect(stack).toHaveAttribute("data-active-index", "0");
  expect(errors).toEqual([]);
});

test("review actions, undo with notes, completion focus, and restart", async ({
  page,
}) => {
  await page.goto("/components/card-stack-animated");
  const queue = page.getByRole("group", { name: "Review queue" });
  await queue.press("ArrowRight");
  await expect(queue).toHaveAttribute("data-active-index", "1");
  await queue.press("Home");
  await expect(queue).toHaveAttribute("data-active-index", "0");
  await queue.getByRole("textbox").fill("Keep this context");
  await expect(queue.getByRole("textbox")).toHaveAttribute(
    "value",
    "Keep this context",
  );
  await queue.getByRole("button", { name: "Save idea" }).click();
  await expect(queue).toBeFocused();
  await page.getByRole("button", { name: "Undo last" }).click();
  await expect(queue).toHaveAttribute("data-count", "3");
  await expect(queue).toBeFocused();
  // Undo restores the item; the current keyed selection remains stable.
  await queue.press("Home");
  await expect(queue).toHaveAttribute("data-active-index", "0");
  await expect(queue.getByRole("textbox")).toHaveValue("Keep this context");
  await queue.getByRole("button", { name: "Save idea" }).click();
  await queue.getByRole("button", { name: "Defer", exact: true }).click();
  await queue.getByRole("button", { name: "Save idea" }).click();
  await expect(
    page.getByRole("heading", { name: "Review complete" }),
  ).toBeFocused();
  await expect(
    page.getByText("2 saved · 1 deferred.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restart queue" }).click();
  await expect(queue).toBeFocused();
  await expect(queue).toHaveAttribute("data-count", "3");
});

test("narrow reduced-motion decks preserve state and fit the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/components/card-stack");
  const stack = page.getByRole("group", { name: "Research chapters" });
  await stack.getByRole("textbox").fill("Keep my note");
  await stack.press("End");
  await expect(stack).toHaveAttribute("data-active-index", "6");
  await stack.press("Home");
  await expect(stack.getByRole("textbox")).toHaveValue("Keep my note");
  await expect(
    stack.locator(
      '[data-slot="card-stack-item"][data-card-stack-visible="true"]',
    ),
  ).toHaveCount(3);
  await page.goto("/components/card-stack-animated");
  const animated = page.getByRole("group", {
    name: "Research briefing",
    exact: true,
  });
  await animated.getByRole("button", { name: "Show next card" }).click();
  expect(
    await animated
      .locator('[data-slot="card-stack-item"]')
      .evaluateAll((items) =>
        items.every((item) => !(item as HTMLElement).style.transform),
      ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
