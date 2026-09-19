import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("component motion quality", () => {
  test("hydrates default Tabs with reduced motion and keeps panels usable", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const hydrationErrors: string[] = [];
    page.on("pageerror", (error) => hydrationErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat/i.test(message.text()))
        hydrationErrors.push(message.text());
    });
    await page.goto("/components/tabs");
    const tabs = page.locator('[data-slot="tabs"]').first();
    await expect(tabs).toHaveAttribute("data-reduced-motion", "true");
    const second = tabs.getByRole("tab").nth(1);
    await second.focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab").nth(2)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(tabs.getByRole("tabpanel")).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });

  for (const direction of ["ltr", "rtl"] as const) {
    test(`Switch travels through intermediate positions in ${direction}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto("/components/switch");
      const input = page.getByRole("switch", {
        name: "Share usage data",
        exact: true,
      });
      await input.scrollIntoViewIfNeeded();
      await input.evaluate((element, dir) => {
        element.parentElement!.dir = dir;
      }, direction);
      const positions = await input.evaluate(async (element) => {
        const thumb = element.parentElement!.querySelector(
          '[data-slot="switch-thumb"]',
        )!;
        const positions = [thumb.getBoundingClientRect().x];
        (element as HTMLInputElement).click();
        await new Promise<void>((resolve) => {
          let first: number | undefined;
          function sample(time: number) {
            first ??= time;
            positions.push(thumb.getBoundingClientRect().x);
            if (time - first < 260) requestAnimationFrame(sample);
            else resolve();
          }
          requestAnimationFrame(sample);
        });
        return positions;
      });
      expect(
        new Set(positions.map((position) => Math.round(position * 10))).size,
      ).toBeGreaterThan(3);
      const travel = positions.at(-1)! - positions[0]!;
      expect(Math.abs(travel)).toBeGreaterThan(12);
      expect(Math.sign(travel)).toBe(direction === "rtl" ? -1 : 1);
      await expect(input).toBeChecked();
      await input.focus();
      await page.keyboard.press("Space");
      await expect(input).not.toBeChecked();
    });
  }

  test("loading preserves Button dimensions and blocks repeated activation", async ({
    page,
  }) => {
    await page.goto("/components/button");
    await page.evaluate(() => document.fonts.ready);
    const idle = page.getByRole("button", {
      name: "Save changes",
      exact: true,
    });
    const before = await idle.evaluate((element) => ({
      width: (element as HTMLElement).offsetWidth,
      height: (element as HTMLElement).offsetHeight,
    }));
    await idle.click();
    const busy = page.getByRole("button", { name: "Saving…", exact: true });
    await expect(busy).toBeDisabled();
    await expect(busy).toHaveAttribute("aria-busy", "true");
    const after = await busy.evaluate((element) => ({
      width: (element as HTMLElement).offsetWidth,
      height: (element as HTMLElement).offsetHeight,
    }));
    expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
    expect(after.height).toBe(before.height);
    await expect(idle).toBeEnabled();
  });

  test("Dialog animates its entrance and restores keyboard focus on close", async ({
    page,
  }) => {
    await page.emulateMedia({
      reducedMotion: "no-preference",
      colorScheme: "dark",
    });
    await page.goto("/components/dialog");
    const trigger = page.getByRole("button", {
      name: "Workspace settings",
      exact: true,
    });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    const opacities = await trigger.evaluate(async (element) => {
      const frames: number[] = [];
      (element as HTMLButtonElement).click();
      await new Promise<void>((resolve) => {
        let first: number | undefined;
        function sample(time: number) {
          first ??= time;
          const dialog = document.querySelector('[data-slot="dialog-content"]');
          if (dialog) frames.push(Number(getComputedStyle(dialog).opacity));
          if (time - first < 320) requestAnimationFrame(sample);
          else resolve();
        }
        requestAnimationFrame(sample);
      });
      return frames;
    });
    expect(opacities.some((opacity) => opacity > 0 && opacity < 0.95)).toBe(
      true,
    );
    await expect(
      page.getByRole("dialog", { name: "Workspace settings" }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toBeFocused();
    await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0.45)",
    );
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("reduced motion removes Switch travel and Dialog entrance animations", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/switch");
    const input = page.getByRole("switch", {
      name: "Share usage data",
      exact: true,
    });
    await input.check();
    expect(
      await input.evaluate(
        (element) =>
          getComputedStyle(
            element.parentElement!.querySelector('[data-slot="switch-thumb"]')!,
          ).transitionDuration,
      ),
    ).toBe("0s");
    await page.goto("/components/dialog");
    await page
      .getByRole("button", { name: "Workspace settings", exact: true })
      .click();
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCSS(
      "animation-name",
      "none",
    );
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCSS(
      "transform",
      "none",
    );
    await expect(page.getByRole("dialog")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Select retains keyboard selection through popup motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/components/select");
    const select = page.locator('[data-slot="select"]').first();
    await select.getByRole("button").click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(select.getByRole("button")).not.toContainText(
      "Choose a region",
    );
  });

  test("mobile controls remain accessible with reduced motion in dark mode", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
    for (const route of [
      "button",
      "checkbox",
      "radio-group",
      "switch",
      "tabs",
      "calendar",
      "select",
    ]) {
      await page.goto(`/components/${route}`);
      // An interaction confirms hydration before checking DOM-only input
      // properties such as a checkbox's indeterminate state.
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Close navigation", exact: true })
        .click();
      if (route === "checkbox") {
        await expect(page.locator("#cb-indeterminate")).toHaveJSProperty(
          "indeterminate",
          true,
        );
      }
      const result = await new AxeBuilder({ page })
        .include("main")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(result.violations, route).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
    }
  });
});
