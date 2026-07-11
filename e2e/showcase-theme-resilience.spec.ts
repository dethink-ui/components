import { expect, test } from "@playwright/test";

const brands = ["teal", "violet", "rose", "amber", "ocean", "forest"];
const themes = ["light", "dark"] as const;

type ContrastMetrics = {
  borderBackground: number;
  destructivePair: number;
  inputBackground: number;
  mutedTextBackground: number;
  mutedTextMuted: number;
  primaryBackground: number;
  primaryMuted: number;
  primaryPair: number;
  ringBackground: number;
};

test.describe("showcase theme resilience", () => {
  test("keeps semantic text and boundaries above contrast targets in every brand", async ({
    page,
  }) => {
    await page.goto("/");

    for (const brand of brands) {
      for (const theme of themes) {
        await page.evaluate(
          ({ brand, theme }) => {
            document.documentElement.dataset.theme = theme;
            document.documentElement.style.colorScheme = theme;
            if (brand === "teal") {
              document.documentElement.removeAttribute("data-brand");
            } else {
              document.documentElement.dataset.brand = brand;
            }
          },
          { brand, theme },
        );

        const metrics = await page.evaluate<ContrastMetrics>(() => {
          const resolveToken = (token: string) => {
            const sample = document.createElement("span");
            sample.style.color = `var(--dt-color-${token})`;
            document.body.append(sample);
            const value = getComputedStyle(sample).color;
            sample.remove();
            return value;
          };
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext("2d", { willReadFrequently: true });

          if (!context) {
            throw new Error("Could not create contrast measurement context.");
          }

          const luminance = (color: string) => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const channels = [...context.getImageData(0, 0, 1, 1).data]
              .slice(0, 3)
              .map((channel) => channel / 255)
              .map((channel) =>
                channel <= 0.04045
                  ? channel / 12.92
                  : ((channel + 0.055) / 1.055) ** 2.4,
              );
            return (
              channels[0]! * 0.2126 +
              channels[1]! * 0.7152 +
              channels[2]! * 0.0722
            );
          };
          const contrast = (first: string, second: string) => {
            const firstLuminance = luminance(first);
            const secondLuminance = luminance(second);
            return (
              (Math.max(firstLuminance, secondLuminance) + 0.05) /
              (Math.min(firstLuminance, secondLuminance) + 0.05)
            );
          };

          const background = resolveToken("background");
          const muted = resolveToken("muted");
          return {
            borderBackground: contrast(resolveToken("border"), background),
            destructivePair: contrast(
              resolveToken("destructive"),
              resolveToken("destructive-foreground"),
            ),
            inputBackground: contrast(resolveToken("input"), background),
            mutedTextBackground: contrast(
              resolveToken("muted-foreground"),
              background,
            ),
            mutedTextMuted: contrast(resolveToken("muted-foreground"), muted),
            primaryBackground: contrast(resolveToken("primary"), background),
            primaryMuted: contrast(resolveToken("primary"), muted),
            primaryPair: contrast(
              resolveToken("primary"),
              resolveToken("primary-foreground"),
            ),
            ringBackground: contrast(resolveToken("ring"), background),
          };
        });

        const context = `${brand} ${theme}`;
        expect(
          metrics.mutedTextBackground,
          `${context} secondary text`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          metrics.mutedTextMuted,
          `${context} muted-surface text`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          metrics.destructivePair,
          `${context} destructive button`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          metrics.primaryBackground,
          `${context} primary text`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          metrics.primaryMuted,
          `${context} selected primary text`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          metrics.primaryPair,
          `${context} primary button`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          metrics.borderBackground,
          `${context} border`,
        ).toBeGreaterThanOrEqual(3);
        expect(
          metrics.inputBackground,
          `${context} input boundary`,
        ).toBeGreaterThanOrEqual(3);
        expect(
          metrics.ringBackground,
          `${context} focus ring`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test("retains focus, current, and disabled cues in forced colors", async ({
    page,
  }) => {
    await page.emulateMedia({
      forcedColors: "active",
      reducedMotion: "reduce",
    });
    await page.goto("/components/button");

    const current = page.locator('a[aria-current="page"]').first();
    await expect(current).toBeVisible();
    await current.focus();
    await expect(current).toBeFocused();
    await expect(current).toHaveCSS("outline-style", "solid");
    await expect(current).toHaveCSS("outline-width", "2px");
    await expect
      .poll(() =>
        current.evaluate((element) =>
          Number.parseInt(getComputedStyle(element).fontWeight, 10),
        ),
      )
      .toBeGreaterThanOrEqual(600);

    const disabled = page.getByRole("button", { name: "Disabled" });
    await disabled.scrollIntoViewIfNeeded();
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveCSS("border-style", "dashed");

    const destructive = page.getByRole("button", { name: "Destructive" });
    await expect(destructive).toBeVisible();
    await expect(destructive).toContainText("Destructive");
  });
});
