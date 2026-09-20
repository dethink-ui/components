import { expect, test } from "@playwright/test";

test.describe("showcase homepage hero", () => {
  test("presents the angled-notch logo as a clear home link", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const homeLink = page.getByRole("link", {
      name: "Dethink Components",
      exact: true,
    });
    const logo = homeLink.locator("svg");

    await expect(homeLink).toHaveAttribute("href", "/");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("aria-hidden", "true");
    await expect(logo.locator("path")).toHaveCount(3);

    const logoBounds = await logo.boundingBox();
    expect(logoBounds).not.toBeNull();
    expect(logoBounds!.width).toBeGreaterThanOrEqual(28);
    expect(logoBounds!.height).toBeGreaterThanOrEqual(28);
  });

  test("keeps both hero actions clear and navigable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const primary = page.getByRole("button", { name: "Components" });
    const secondary = page.getByRole("button", { name: "Recipes" });
    await expect(primary).toHaveAttribute("data-variant", "solid");
    await expect(secondary).toHaveAttribute("data-variant", "outline");

    const primaryBounds = await primary.boundingBox();
    const secondaryBounds = await secondary.boundingBox();
    expect(primaryBounds).not.toBeNull();
    expect(secondaryBounds).not.toBeNull();
    expect(primaryBounds!.height).toBeGreaterThanOrEqual(44);
    expect(secondaryBounds!.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(primaryBounds!.y - secondaryBounds!.y)).toBeLessThan(2);
    expect(primaryBounds!.width).toBeGreaterThan(160);
    expect(secondaryBounds!.width).toBeGreaterThan(160);
    const primaryLabelBounds = await primary
      .locator('[data-slot="reveal-button-label-text"]')
      .boundingBox();
    const secondaryLabelBounds = await secondary
      .locator('[data-slot="reveal-button-label-text"]')
      .boundingBox();
    expect(primaryLabelBounds).not.toBeNull();
    expect(secondaryLabelBounds).not.toBeNull();
    expect(
      primaryLabelBounds!.x + primaryLabelBounds!.width,
    ).toBeLessThanOrEqual(primaryBounds!.x + primaryBounds!.width);
    expect(
      secondaryLabelBounds!.x + secondaryLabelBounds!.width,
    ).toBeLessThanOrEqual(secondaryBounds!.x + secondaryBounds!.width);

    await primary.click();
    await expect(
      page.getByRole("heading", { name: "Component matrix" }),
    ).toBeInViewport();

    await page.goto("/");
    await page.getByRole("button", { name: "Recipes" }).click();
    await expect(page).toHaveURL(/\/recipes$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("copies install proof and exposes visible success feedback", async ({
    context,
    page,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:3015",
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByText("✓ installed · tokens wired")).toBeVisible();
    const copy = page.getByRole("button", { name: "Copy" });
    await expect(copy).toContainText("Copy");
    await copy.click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe("npx shadcn@latest add @dethink/button");

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(
      page.getByText("✓ installed src/components/button.tsx"),
    ).toBeVisible();
    await expect(
      page.getByText(/✓ tokens wired to --dt-\* contract/),
    ).toBeVisible();
  });

  test("brings component evidence into the first mobile viewport without disturbing desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const overviewBounds = await page.locator("#overview").boundingBox();
    const terminalBounds = await page.locator(".sc-terminal").boundingBox();
    const firstCardBounds = await page
      .getByRole("list", { name: "Component state previews" })
      .locator(":scope > li > article")
      .first()
      .boundingBox();
    expect(overviewBounds).not.toBeNull();
    expect(terminalBounds).not.toBeNull();
    expect(firstCardBounds).not.toBeNull();
    expect(overviewBounds!.y + overviewBounds!.height).toBeLessThan(680);
    expect(terminalBounds!.y + terminalBounds!.height).toBeLessThan(640);
    expect(firstCardBounds!.y).toBeLessThan(844);

    await page.setViewportSize({ width: 1440, height: 900 });
    const headingBounds = await page
      .getByRole("heading", { level: 1 })
      .boundingBox();
    const desktopTerminalBounds = await page
      .locator(".sc-terminal")
      .boundingBox();
    expect(headingBounds).not.toBeNull();
    expect(desktopTerminalBounds).not.toBeNull();
    expect(desktopTerminalBounds!.x).toBeGreaterThan(
      headingBounds!.x + headingBounds!.width,
    );
    expect(Math.abs(desktopTerminalBounds!.y - headingBounds!.y)).toBeLessThan(
      100,
    );
  });

  test("renders the final hierarchy immediately with reduced motion", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const motionItems = page.locator("[data-hero-motion-item]");
    await expect(motionItems).toHaveCount(5);
    for (let index = 0; index < (await motionItems.count()); index += 1) {
      await expect(motionItems.nth(index)).toHaveCSS("transform", "none");
      await expect(motionItems.nth(index)).toHaveCSS("opacity", "1");
    }
    await expect(page.locator("[data-install-cursor]")).toHaveCSS(
      "animation-name",
      "none",
    );
    await expect(
      page.getByRole("button", { name: "Components" }),
    ).toBeVisible();
  });
});
