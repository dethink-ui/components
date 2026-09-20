import { expect, test } from "@playwright/test";

test("share metadata includes a fetchable image on representative routes", async ({
  page,
  request,
}) => {
  for (const route of [
    "/",
    "/docs",
    "/components/data-table",
    "/recipes/automation-landing",
  ]) {
    await page.goto(route);
    const image = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(image).toMatch(
      /^https:\/\/components\.dethink\.co\.uk\/opengraph-image/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      image!,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      await page.title(),
    );
    const url = new URL(image!);
    const response = await request.get(url.pathname + url.search);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    const png = await response.body();
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  }
});

test("keyboard-only overlay traversal traps focus and returns to the trigger", async ({
  page,
}) => {
  await page.goto("/components/dialog");
  const trigger = page.getByRole("button", {
    name: "Workspace settings",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Workspace settings" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription(
    "Changes apply to every dashboard in this workspace.",
  );
  for (const key of [
    ...Array<string>(6).fill("Tab"),
    ...Array<string>(6).fill("Shift+Tab"),
  ]) {
    await page.keyboard.press(key);
    expect(
      await dialog.evaluate((node) => node.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();

  await page.goto("/components/dropdown-menu");
  const menuTrigger = page.getByRole("button", {
    name: "Report actions",
    exact: true,
  });
  await menuTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: /Refresh data/ }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menuTrigger).toBeFocused();
});

test("form descriptions and sortable table state reach the accessibility tree", async ({
  page,
}) => {
  await page.goto("/components/form-field");
  const handle = page.getByRole("textbox", { name: "Handle", exact: true });
  await expect(handle).toHaveAccessibleDescription(
    "Lowercase letters, numbers, and hyphens only.",
  );
  const revoked = page.getByRole("textbox", { name: "API key", exact: true });
  await expect(revoked).toHaveAttribute("aria-invalid", "true");
  await expect(revoked).toHaveAccessibleDescription(
    "This key was revoked on June 2.",
  );
  const errorId = await revoked.getAttribute("aria-errormessage");
  expect(await page.locator(`[id="${errorId}"]`).textContent()).toBe(
    "This key was revoked on June 2.",
  );

  await page.goto("/components/data-table");
  const table = page.getByRole("table", { name: "Latest deployments" });
  const service = table.getByRole("columnheader", { name: /Service/ });
  await expect(service).toHaveAttribute("aria-sort", "ascending");
  await service.getByRole("button").focus();
  await page.keyboard.press("Enter");
  await expect(service).toHaveAttribute("aria-sort", "descending");
  const filter = page.getByPlaceholder("Filter deployments…");
  await filter.focus();
  await page.keyboard.type("no-matching-service");
  await expect(table).toContainText("No results");
  await filter.fill("");
  await expect(table.getByRole("row")).toHaveCount(6);
});

test("announcement surfaces reflow at 320px and with enlarged text in RTL", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/",
    "/docs/installation",
    "/components/sidebar-shell",
    "/recipes/automation-login",
    "/recipes/command-center-dashboard",
  ]) {
    for (const enlarged of [false, true]) {
      await page.setViewportSize({ width: enlarged ? 720 : 320, height: 900 });
      await page.goto(route);
      if (enlarged)
        await page.evaluate(() => {
          document.documentElement.dir = "rtl";
          document.documentElement.style.fontSize = "200%";
        });
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        )
        .toBeLessThanOrEqual(1);
      await page.screenshot({
        path: testInfo.outputPath(
          `${route.replaceAll("/", "-") || "home"}-${enlarged ? "rtl-enlarged" : "mobile"}.png`,
        ),
        fullPage: false,
      });
    }
  }
});
