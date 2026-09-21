import { expect, test, type Locator } from "@playwright/test";

async function geometry(rail: Locator) {
  return rail.evaluate((element) => {
    const railBox = element.getBoundingClientRect();
    const contentBox =
      element.parentElement!.lastElementChild!.getBoundingClientRect();
    return {
      railWidth: railBox.width,
      contentX: contentBox.x,
      contentWidth: contentBox.width,
    };
  });
}

for (const direction of ["ltr", "rtl"] as const) {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test(`vertical icon rail stays stable in ${direction} with ${reducedMotion} motion`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto("/components/tabs");
      await page.evaluate(() => document.fonts.ready);
      const rail = page.getByRole("tablist", {
        name: "Workspace rail (vertical)",
        exact: true,
      });
      await rail.evaluate((element, dir) => {
        element.parentElement!.dir = dir;
      }, direction);
      await rail.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const before = await geometry(rail);
      const labels = rail.locator('[data-slot="tabs-trigger-label"]');
      await expect(labels).toHaveCount(4);
      for (const label of await labels.all()) {
        await expect(label).toBeVisible();
        await expect(label).toHaveCSS("opacity", "1");
      }

      async function expectStableDuring(action: () => Promise<unknown>) {
        await action();
        const samples = await rail.evaluate(async (element) => {
          const samples: {
            railWidth: number;
            contentX: number;
            contentWidth: number;
          }[] = [];
          await new Promise<void>((resolve) => {
            const start = performance.now();
            function sample() {
              const railBox = element.getBoundingClientRect();
              const contentBox =
                element.parentElement!.lastElementChild!.getBoundingClientRect();
              samples.push({
                railWidth: railBox.width,
                contentX: contentBox.x,
                contentWidth: contentBox.width,
              });
              if (performance.now() - start < 350)
                requestAnimationFrame(sample);
              else resolve();
            }
            sample();
          });
          return samples;
        });
        for (const sample of samples) {
          expect(Math.abs(sample.railWidth - before.railWidth)).toBeLessThan(
            0.5,
          );
          expect(Math.abs(sample.contentX - before.contentX)).toBeLessThan(0.5);
          expect(
            Math.abs(sample.contentWidth - before.contentWidth),
          ).toBeLessThan(0.5);
        }
      }

      const settings = rail.getByRole("tab", { name: "Settings", exact: true });
      const inbox = rail.getByRole("tab", { name: "Inbox", exact: true });
      await expectStableDuring(() => settings.hover());
      await expectStableDuring(() => page.mouse.move(0, 0));
      await expectStableDuring(() => inbox.click());
      await expect(inbox).toHaveAttribute("aria-selected", "true");
      await expectStableDuring(() => settings.hover());
      await expectStableDuring(() => settings.click());
      await expect(settings).toHaveAttribute("aria-selected", "true");
      await expectStableDuring(() => page.keyboard.press("ArrowUp"));
      await expect(
        rail.getByRole("tab", { name: "Reports", exact: true }),
      ).toBeFocused();
      for (const label of await labels.all()) {
        await expect(label).toHaveCSS("opacity", "1");
      }
    });
  }
}
