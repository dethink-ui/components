import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/chat-bubble");
  await expect(
    page.getByRole("button", { name: "Chat with Dethink" }),
  ).toBeVisible();
});

test("keyboard flow, streaming while minimized, unread and draft preservation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const launcher = page.getByRole("button", { name: "Chat with Dethink" });
  await launcher.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Dethink", exact: true });
  await expect(dialog).toBeFocused();
  const input = dialog.getByRole("textbox", { name: "Message" });
  await input.fill("Help me get started");
  await input.press("Enter");
  await expect(
    dialog.getByText("Help me get started", { exact: true }),
  ).toBeVisible();
  await input.fill("My next question");
  await input.press("Escape");
  await expect(launcher).toBeFocused();
  await expect(dialog).toBeHidden();
  await expect(launcher).toHaveAccessibleDescription("1 unread messages", {
    timeout: 10000,
  });
  await launcher.click();
  await expect(input).toHaveValue("My next question");
  await expect(
    dialog.getByText(/Absolutely. Start with one small step/),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("failed send, attachment, stop and retry recover without losing the conversation", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Simulate a send failure" }).click();
  await page.getByRole("button", { name: "Chat with Dethink" }).click();
  const dialog = page.getByRole("dialog", { name: "Dethink", exact: true });
  const input = dialog.getByRole("textbox", { name: "Message" });
  await input.fill("Please help");
  await input.press("Enter");
  await expect(dialog.getByText(/Demo connection interrupted/)).toBeVisible();
  await expect(input).toHaveValue("Please help");
  await dialog.locator('input[type="file"]').setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("demo"),
  });
  await input.press("Enter");
  await dialog.getByRole("button", { name: "Stop response" }).click();
  await expect(
    dialog.getByText("Stopped · partial response saved"),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Try again" }).click();
  await expect(dialog.locator('[data-slot="chat-activity"]')).toHaveAttribute(
    "data-state",
    "completed",
    { timeout: 10000 },
  );
  await expect(dialog.getByText("notes.txt")).toBeVisible();
});

test("reading older messages survives new output and minimize", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Chat with Dethink" }).click();
  const dialog = page.getByRole("dialog", { name: "Dethink", exact: true });
  const input = dialog.getByRole("textbox", { name: "Message" });
  await input.fill("A longer question about my project. ".repeat(35));
  await input.press("Enter");
  const scroller = dialog.getByRole("region", {
    name: "Conversation messages",
  });
  await scroller.evaluate((node) => {
    node.scrollTop = 0;
    node.dispatchEvent(new Event("scroll"));
  });
  await expect(dialog.locator('[data-slot="chat-activity"]')).toHaveAttribute(
    "data-state",
    "completed",
    { timeout: 10000 },
  );
  expect(await scroller.evaluate((node) => node.scrollTop)).toBeLessThan(5);
  await dialog.getByRole("button", { name: "Minimize chat" }).click();
  await page.getByRole("button", { name: "Chat with Dethink" }).click();
  expect(await scroller.evaluate((node) => node.scrollTop)).toBeLessThan(5);
});

test("custom support widget is independent and labelled", async ({ page }) => {
  await page.getByRole("button", { name: "Enable support widget" }).click();
  const support = page.getByRole("dialog", { name: "Customer support" });
  await expect(support).toBeVisible();
  await page.getByRole("button", { name: "Chat with Dethink" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(2);
  await support.getByRole("button", { name: "Minimize support" }).click();
  await expect(
    page.getByRole("dialog", { name: "Dethink", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open support" }),
  ).toBeFocused();
});

for (const scenario of ["light", "dark", "mobile-rtl"] as const) {
  test(`accessible visual state: ${scenario}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (scenario === "mobile-rtl") {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.evaluate(() => {
        document.documentElement.dir = "rtl";
        document.querySelectorAll("[data-dethink-provider]").forEach((node) => {
          node.setAttribute("dir", "rtl");
          node.setAttribute("data-density", "compact");
        });
      });
    } else {
      await page
        .getByRole("button", {
          name: scenario === "dark" ? "Dark theme" : "Light theme",
          exact: true,
        })
        .click();
    }
    await page.getByRole("button", { name: "Chat with Dethink" }).click();
    const dialog = page.getByRole("dialog", { name: "Dethink", exact: true });
    await expect(dialog).toBeFocused();
    const box = await dialog.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    expect(
      (
        await new AxeBuilder({ page })
          .include('[data-slot="chat-bubble"]')
          .analyze()
      ).violations,
    ).toEqual([]);
    await expect(dialog).toHaveScreenshot(`chat-bubble-${scenario}.png`, {
      style: "nextjs-portal { visibility: hidden !important; }",
    });
    await dialog.getByRole("button", { name: "Minimize chat" }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "Chat with Dethink" }).click();
    await expect(dialog).toBeVisible();
  });
}
