import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pdf = (name: string, bytes = 1024) => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.alloc(bytes, "a"),
});
const workspace = (page: Page) =>
  page.locator('[data-slot="file-upload"]').first();
async function drop(
  root: Locator,
  files: { name: string; type: string; size?: number }[],
) {
  const data = await root.page().evaluateHandle((items) => {
    const transfer = new DataTransfer();
    Object.defineProperty(transfer, "effectAllowed", { value: "all" });
    for (const item of items)
      transfer.items.add(
        new File([new Uint8Array(item.size ?? 100)], item.name, {
          type: item.type,
          lastModified: 1,
        }),
      );
    // Synthetic files have no native filesystem entry; model a real file drag.
    Object.defineProperty(DataTransferItem.prototype, "webkitGetAsEntry", {
      configurable: true,
      value: undefined,
    });
    return transfer;
  }, files);
  const target = root.locator('[data-slot="file-upload-drop-zone"]');
  await target.dispatchEvent("dragenter", { dataTransfer: data });
  await expect(target).toHaveAttribute("data-drop-target", "true");
  await target.dispatchEvent("dragover", { dataTransfer: data });
  await target.dispatchEvent("drop", { dataTransfer: data });
  await data.dispose();
}
test.beforeEach(async ({ page }) => {
  await page.goto("/components/file-upload");
  await expect(
    page.getByRole("heading", { name: "File Upload", exact: true }),
  ).toBeVisible();
});

test("mixed drops keep accepted files, explain size/type errors and retain the drop strip", async ({
  page,
}) => {
  const root = workspace(page);
  await drop(root, [
    { name: "Research brief.pdf", type: "application/pdf" },
    { name: "unsafe.exe", type: "application/octet-stream" },
    { name: "large.pdf", type: "application/pdf", size: 21 * 1024 * 1024 },
  ]);
  await expect(root.locator('[data-slot="file-upload-item"]')).toHaveCount(1);
  await expect(root.getByText(/File type not supported/)).toBeVisible();
  await expect(root.getByText(/Too large/)).toBeVisible();
  await expect(
    root.getByRole("button", { name: "Choose files", exact: true }),
  ).toBeVisible();
  await drop(root, [{ name: "notes.pdf", type: "application/pdf" }]);
  await expect(root.locator('[data-slot="file-upload-item"]')).toHaveCount(2);
  await expect(
    root.getByRole("button", { name: "Upload 2 files" }),
  ).toBeEnabled();
});

test("manual upload has compact real progress, cancellation and per-file retry", async ({
  page,
}) => {
  const root = workspace(page);
  await root
    .locator('input[type="file"]')
    .setInputFiles([pdf("Research brief.pdf"), pdf("Notes.pdf")]);
  await expect(root.getByRole("progressbar")).toHaveCount(0);
  await root.getByRole("button", { name: "Upload 2 files" }).click();
  const bar = root.getByRole("progressbar", {
    name: "Uploading Research brief.pdf",
  });
  await expect(bar).toBeVisible();
  const box = (await bar.boundingBox())!;
  expect(box.height).toBeLessThanOrEqual(3);
  expect(box.width).toBeLessThanOrEqual(192);
  await root.getByRole("button", { name: "Cancel Research brief.pdf" }).click();
  await expect(
    root.getByRole("button", { name: "Retry Research brief.pdf" }),
  ).toBeVisible();
  await root.getByRole("button", { name: "Retry Research brief.pdf" }).click();
  await root.getByRole("button", { name: "Cancel Notes.pdf" }).focus();
  await expect(root.locator('[data-state="uploaded"]')).toHaveCount(2, {
    timeout: 10000,
  });
  await expect(
    root.getByRole("button", { name: "Remove Notes.pdf" }),
  ).toBeFocused();
});

test("simulated failure retries without restarting successful files", async ({
  page,
}) => {
  const root = workspace(page);
  await root
    .locator('input[type="file"]')
    .setInputFiles([pdf("Retry me.pdf"), pdf("Keep me.pdf")]);
  await page.getByRole("button", { name: "Make next upload fail" }).click();
  await root.getByRole("button", { name: "Upload 2 files" }).click();
  await expect(
    root.getByText("Connection interrupted. Retry this file.", { exact: true }),
  ).toBeVisible();
  await expect(root.locator('[data-state="uploaded"]')).toHaveCount(1, {
    timeout: 10000,
  });
  await root.getByRole("button", { name: "Retry Retry me.pdf" }).click();
  await expect(root.locator('[data-state="uploaded"]')).toHaveCount(1);
  await expect(root.locator('[data-state="uploaded"]')).toHaveCount(2, {
    timeout: 10000,
  });
});

test("single replacement preserves the original on invalid selection or multi-file drop", async ({
  page,
}) => {
  const root = page.locator('[data-slot="file-upload"]').nth(1);
  await root.locator('input[type="file"]').setInputFiles(pdf("Original.pdf"));
  await root.locator('input[type="file"]').setInputFiles({
    name: "wrong.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("bad"),
  });
  await expect(root.getByText("Original.pdf")).toBeVisible();
  await drop(root, [
    { name: "a.pdf", type: "application/pdf" },
    { name: "b.pdf", type: "application/pdf" },
  ]);
  await expect(
    root.getByText("Choose one file at a time.", { exact: true }),
  ).toHaveCount(2);
  await expect(root.getByText("Original.pdf")).toBeVisible();
  await root.locator('input[type="file"]').setInputFiles(pdf("New.pdf"));
  await expect(root.getByText("Original.pdf")).toHaveCount(0);
  await expect(root.getByText("New.pdf")).toBeVisible();
});

test("keyboard picker, focus recovery and accessibility", async ({ page }) => {
  const root = workspace(page);
  const choose = root.getByRole("button", {
    name: "Choose files",
    exact: true,
  });
  await choose.focus();
  const picking = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  await (await picking).setFiles(pdf("Keyboard.pdf"));
  await root.getByRole("button", { name: "Remove Keyboard.pdf" }).focus();
  await page.keyboard.press("Enter");
  await expect(choose).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-slot="file-upload"]')
        .analyze()
    ).violations,
  ).toEqual([]);
});

for (const width of [390, 1280])
  test(`compact layout and visual states at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const root = workspace(page);
    await root
      .locator('input[type="file"]')
      .setInputFiles([
        pdf("Research brief.pdf", 2457600),
        pdf("Interview notes.pdf", 860160),
        pdf(
          "A-long-filename-that-still-keeps-its-extension-readable-on-small-screens.pdf",
        ),
      ]);
    await expect(root).toBeVisible();
    expect(
      await root.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    await root.screenshot({ path: testInfo.outputPath("staged.png") });
    await root.getByRole("button", { name: "Upload 3 files" }).click();
    await expect(root.getByRole("progressbar").first()).toBeVisible();
    await root.screenshot({ path: testInfo.outputPath("uploading.png") });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await root.evaluate((el) => {
      el.setAttribute("dir", "rtl");
      el.setAttribute("data-density", "compact");
      el.setAttribute("data-theme", "dark");
    });
    expect(
      await root.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    await root.screenshot({
      path: testInfo.outputPath("rtl-dark-compact.png"),
    });
  });

test("drag target survives entering children and clears after leaving", async ({
  page,
}) => {
  const root = workspace(page);
  const target = root.locator('[data-slot="file-upload-drop-zone"]');
  const data = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    Object.defineProperty(dt, "effectAllowed", { value: "all" });
    dt.items.add(new File(["a"], "a.pdf", { type: "application/pdf" }));
    return dt;
  });
  await target.dispatchEvent("dragenter", { dataTransfer: data });
  await target
    .getByRole("button", { name: "Choose files", exact: true })
    .dispatchEvent("dragenter", { dataTransfer: data });
  await target.dispatchEvent("dragleave", { dataTransfer: data });
  await expect(target).toHaveAttribute("data-drop-target", "true");
  await target
    .getByRole("button", { name: "Choose files", exact: true })
    .dispatchEvent("dragleave", { dataTransfer: data });
  await expect(target).not.toHaveAttribute("data-drop-target", "true");
  await data.dispose();
});
