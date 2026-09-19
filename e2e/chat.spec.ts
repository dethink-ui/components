import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const recipe = "/recipes/ai-chat-studio?view=preview";
test("approval, streaming, sources, and an independent next draft", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(recipe, { waitUntil: "networkidle" });
  const chat = page.locator('[data-slot="chat"]');
  const input = chat.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("Ask for approval before reading documents");
  await input.press("Enter");
  await expect(chat.getByText("Thinking…", { exact: true })).toBeVisible();
  await expect(
    chat.getByRole("button", { name: "Approve", exact: true }),
  ).toBeVisible();
  await chat.getByRole("button", { name: "Approve", exact: true }).click();
  await input.fill("My next question");
  await expect(chat.locator('[data-slot="chat-activity"]')).toHaveAttribute(
    "data-state",
    "completed",
    { timeout: 15000 },
  );
  await expect(input).toHaveValue("My next question");
  await expect(input).toBeFocused();
  await expect(
    chat.locator('[data-slot="citation-card"]').last(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("stop preserves partial output and retry recovers an interrupted run", async ({
  page,
}) => {
  await page.goto(recipe, { waitUntil: "networkidle" });
  const chat = page.locator('[data-slot="chat"]');
  const input = chat.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("Give me a slow response");
  await input.press("Enter");
  await expect(
    chat.getByRole("button", { name: "Writing…", exact: true }),
  ).toBeVisible({ timeout: 10000 });
  await expect(
    chat
      .locator('[data-slot="chat-message"]')
      .last()
      .locator('[data-slot="message-content"]'),
  ).not.toBeEmpty();
  await chat
    .getByRole("button", { name: "Stop response", exact: true })
    .click();
  await expect(
    chat.getByText("Stopped · partial response saved"),
  ).toBeVisible();
  await chat.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(chat.locator('[data-slot="chat-activity"]')).toHaveAttribute(
    "data-state",
    "completed",
    { timeout: 15000 },
  );
});
test("drafts, background runs, rename, delete, and version selection", async ({
  page,
}) => {
  await page.goto(recipe, { waitUntil: "networkidle" });
  const chat = page.locator('[data-slot="chat"]');
  const nav = page.getByRole("navigation", {
    name: "Conversations",
    exact: true,
  });
  await chat.getByRole("button", { name: "Next response version" }).click();
  await expect(chat.getByText(/Start with 20 design partners/)).toBeVisible();
  await chat
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Draft for launch");
  await nav
    .getByRole("button", { name: /Calmer interfaces/ })
    .first()
    .click();
  await expect(
    chat.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveValue("How can motion make this interface feel calmer?");
  await chat
    .getByRole("textbox", { name: "Message", exact: true })
    .press("Enter");
  await nav.getByRole("button", { name: /^Launch strategy/ }).click();
  await expect(
    chat.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveValue("Draft for launch");
  await expect(
    nav.getByRole("button", { name: /Calmer interfaces/ }).first(),
  ).toContainText("Working…");
  await nav
    .getByRole("button", { name: "Rename Launch strategy", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Conversation name" })
    .fill("Launch plan");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await expect(
    chat.getByRole("heading", { name: "Launch plan" }),
  ).toBeVisible();
  await nav
    .getByRole("button", { name: "Delete Launch plan", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete conversation", exact: true })
    .click();
  await expect(
    chat.getByRole("heading", { name: "Calmer interfaces" }),
  ).toBeVisible();
});
test("file failure blocks send, retry recovers, and removal works", async ({
  page,
}) => {
  await page.goto(recipe, { waitUntil: "networkidle" });
  const chat = page.locator('[data-slot="chat"]');
  await chat.locator('input[type="file"]').setInputFiles({
    name: "upload-fail.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("sample"),
  });
  await expect(
    chat.getByText("Sample upload failed. Retry to recover."),
  ).toBeVisible();
  await chat
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Read this");
  await expect(
    chat.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  await chat.getByRole("button", { name: "Retry upload-fail.txt" }).click();
  await expect(chat.locator('[data-slot="attachment-bubble"]')).toHaveAttribute(
    "data-state",
    "ready",
  );
  await expect(
    chat.getByRole("button", { name: "Send message" }),
  ).toBeEnabled();
  await chat.getByRole("button", { name: "Remove upload-fail.txt" }).click();
  await expect(chat.locator('[data-slot="attachment-bubble"]')).toHaveCount(0);
});
test("mobile history, keyboard focus, reduced motion, and axe", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(recipe, { waitUntil: "networkidle" });
  const chat = page.locator('[data-slot="chat"]');
  await expect(chat.locator('[data-slot="accordion"]')).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await chat.getByRole("button", { name: "Open conversation history" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^A place for ideas/ })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    chat.getByRole("heading", { name: "What’s on your mind?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .include('[data-slot="chat-workspace"]')
    .analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
});
test("AI SDK text, tool approval, source and file stream contract", async ({
  page,
}) => {
  await page.goto("/components/chat#sdk-heading", { waitUntil: "networkidle" });
  const section = page.locator('section[aria-labelledby="sdk-heading"]');
  const chat = section.locator('[data-slot="chat"]');
  await section.getByRole("button", { name: "Try approval" }).click();
  await chat.getByRole("button", { name: "Send message" }).click();
  await expect(
    chat.getByRole("button", { name: "Approve", exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await chat.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(
    chat.getByText("A clear next step", { exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await expect(chat.locator('[data-slot="chat-activity"]')).toHaveAttribute(
    "data-state",
    "completed",
    { timeout: 15000 },
  );
  await expect(
    chat.getByRole("link", { name: /Sample launch playbook/ }),
  ).toBeVisible();
  await expect(chat.locator('[data-slot="attachment-bubble"]')).toHaveAttribute(
    "data-state",
    "ready",
  );
});
test("scroll anchors survive prepending and streaming does not steal focus", async ({
  page,
}) => {
  await page.goto("/components/chat/performance", { waitUntil: "networkidle" });
  const viewport = page.locator('[data-slot="message-scroller"]');
  await viewport.evaluate((node) => {
    node.scrollTop = 1200;
  });
  await expect(
    page.getByRole("button", { name: /Jump to latest/ }),
  ).toBeVisible();
  const anchor = await viewport.evaluate((node) => {
    const top = node.getBoundingClientRect().top;
    const row = [...node.querySelectorAll<HTMLElement>("[data-chat-row]")].find(
      (item) => item.getBoundingClientRect().bottom > top + 1,
    )!;
    return {
      id: row.dataset.chatRow!,
      offset: row.getBoundingClientRect().top - top,
    };
  });
  await page.getByRole("button", { name: "Prepend 20 messages" }).click();
  await expect
    .poll(async () =>
      viewport
        .locator(`[data-chat-row="${anchor.id}"]`)
        .evaluate(
          (row) =>
            row.getBoundingClientRect().top -
            row
              .closest('[data-slot="message-scroller"]')!
              .getBoundingClientRect().top,
        ),
    )
    .toBeCloseTo(anchor.offset, 0);
  await page
    .getByRole("button", { name: "Stream 90 updates at 30/sec" })
    .click();
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Still reading");
  await expect(page.getByTestId("performance-result")).toContainText(
    '"updates":90',
    { timeout: 15000 },
  );
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: /Jump to latest/ }),
  ).toBeVisible();
  const result = JSON.parse(
    (await page.getByTestId("performance-result").textContent())!,
  );
  expect(result.completedRowRenders).toBe(0);
  console.log("500-row measurement", result);
  await page.getByRole("button", { name: /Jump to latest/ }).click();
  await expect
    .poll(async () =>
      viewport.evaluate(
        (node) => node.scrollHeight - node.clientHeight - node.scrollTop,
      ),
    )
    .toBeLessThan(2);
});
test("5,000 rows are windowed and measured while the latest answer streams", async ({
  page,
}) => {
  await page.goto("/components/chat/performance", { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "5,000 messages", exact: true })
    .click();
  const list = page.locator('[data-slot="message-list"]');
  await expect(list).toHaveAttribute("data-windowed", "true");
  await expect
    .poll(() => list.locator('[data-chat-row="message-4999"]').count())
    .toBe(1);
  expect(await list.locator("[data-chat-row]").count()).toBeLessThan(80);
  const viewport = page.locator('[data-slot="message-scroller"]');
  await viewport.evaluate((node) => {
    node.scrollTop = 1800;
  });
  await expect
    .poll(() => list.locator('[data-chat-row="message-4999"]').count())
    .toBe(0);
  await list.locator("[data-chat-row] button").first().focus();
  const focusedId = await page.evaluate(
    () =>
      document.activeElement?.closest<HTMLElement>("[data-chat-row]")?.dataset
        .chatRow,
  );
  await viewport.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await expect
    .poll(() => list.locator('[data-chat-row="message-4999"]').count())
    .toBe(1);
  expect(
    await page.evaluate(
      () =>
        document.activeElement?.closest<HTMLElement>("[data-chat-row]")?.dataset
          .chatRow,
    ),
  ).toBe(focusedId);
  await page
    .getByRole("button", { name: "Stream 90 updates at 30/sec" })
    .click();
  await expect(page.getByTestId("performance-result")).toContainText(
    '"updates":90',
    { timeout: 15000 },
  );
  const result = JSON.parse(
    (await page.getByTestId("performance-result").textContent())!,
  );
  console.log("5,000-row measurement", result);
  expect(result.mountedRows).toBeLessThan(80);
});

test("SDK denial, cancellation before a token, and error recovery", async ({
  page,
}) => {
  await page.goto("/components/chat#sdk-heading", { waitUntil: "networkidle" });
  const section = page.locator('section[aria-labelledby="sdk-heading"]');
  const chat = section.locator('[data-slot="chat"]');
  const input = chat.getByRole("textbox", { name: "Message", exact: true });
  await section.getByRole("button", { name: "Try approval" }).click();
  await chat.getByRole("button", { name: "Send message" }).click();
  await chat.getByRole("button", { name: "Deny", exact: true }).click();
  await expect(chat.getByText(/I’ll continue without accessing/)).toBeVisible();
  await expect(chat.locator('[data-slot="chat-activity"]')).toHaveAttribute(
    "data-state",
    "completed",
  );
  await input.fill("Start a new response");
  await input.press("Enter");
  await chat
    .getByRole("button", { name: "Stop response", exact: true })
    .click();
  await expect(chat.locator('[data-slot="chat-activity"]')).toHaveAttribute(
    "data-state",
    "stopped",
  );
  await section.getByRole("button", { name: "Try an error" }).click();
  await chat.getByRole("button", { name: "Send message" }).click();
  await expect(chat.locator('[data-slot="chat-activity"]')).toHaveAttribute(
    "data-state",
    "error",
  );
  await chat
    .getByRole("button", { name: "Try again", exact: true })
    .last()
    .click();
  await expect(chat.locator('[data-slot="chat-activity"]')).toHaveAttribute(
    "data-state",
    "completed",
    { timeout: 15000 },
  );
});
