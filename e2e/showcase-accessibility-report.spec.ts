import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const surfaces = [
  { route: "/", state: "default" },
  { route: "/docs/accessibility", state: "default" },
  { route: "/components/button", state: "default" },
  { route: "/components/form-field", state: "default" },
  { route: "/components/data-table", state: "default" },
  { route: "/components/sidebar-shell", state: "default" },
  { route: "/components/navdock", state: "default" },
  { route: "/components/chat", state: "default" },
  { route: "/recipes/automation-login", state: "default" },
  { route: "/recipes/command-center-dashboard", state: "default" },
  { route: "/components/dialog", state: "open dialog" },
  { route: "/components/dropdown-menu", state: "open menu" },
] as const;

for (const theme of ["light", "dark"] as const) {
  for (const width of [1440, 390]) {
    for (const { route, state } of surfaces) {
      test(`${route} | ${state} | ${theme} | ${width}px`, async ({
        page,
        browser,
      }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.addInitScript((value) => {
          localStorage.setItem("dethink-theme", value);
        }, theme);
        await page.goto(route);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(
          page.getByRole("heading", { level: 1 }).first(),
        ).toBeVisible();
        // Settle theme transitions before opening overlays, which can suspend
        // animation playback in their inert background content.
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(
            document
              .getAnimations()
              .filter(
                (animation) =>
                  animation instanceof CSSTransition &&
                  animation.playState === "running",
              )
              .map((animation) => animation.finished.catch(() => undefined)),
          );
        });
        if (state === "open dialog") {
          await page
            .getByRole("button", { name: "Workspace settings", exact: true })
            .click();
          await expect(
            page.getByRole("dialog", { name: "Workspace settings" }),
          ).toBeVisible();
        }
        if (state === "open menu") {
          await page
            .getByRole("button", { name: "Report actions", exact: true })
            .click();
          await expect(page.getByRole("menu")).toBeVisible();
        }
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        await testInfo.attach("axe-results", {
          body: JSON.stringify(results, null, 2),
          contentType: "application/json",
        });
        await testInfo.attach("scan-context", {
          body: JSON.stringify(
            {
              route,
              state,
              theme,
              viewport: { width, height: 900 },
              reducedMotion: "reduce",
              browser: testInfo.project.name,
              browserVersion: browser.version(),
              scope:
                "Page scanned after fonts and running CSS theme transitions settle, including the visible overlay when open. Default brand palette. No rules or selectors excluded.",
            },
            null,
            2,
          ),
          contentType: "application/json",
        });
        expect(results.violations).toEqual([]);
      });
    }
  }
}
