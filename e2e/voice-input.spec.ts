import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("variant and size demos do not leak props or request the real microphone", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.assign(window, { microphoneRequests: 0 });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          const tracker = window as unknown as { microphoneRequests: number };
          tracker.microphoneRequests += 1;
          throw new DOMException(
            "Demos must not request the microphone",
            "NotAllowedError",
          );
        },
      },
    });
  });
  await page.goto("/components/voice-input");
  for (const region of ["Variants", "Sizes"]) {
    const controls = page
      .getByRole("region", { name: region, exact: true })
      .locator('[data-slot="voice-input"]');
    await expect(controls).toHaveCount(5);
    for (const control of await controls.all()) {
      await control.click();
      await expect(control).toHaveAttribute("data-state", "recording");
      await control.click();
      await expect(control).toHaveAttribute("data-state", "idle");
    }
  }
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { microphoneRequests: number })
          .microphoneRequests,
    ),
  ).toBe(0);
  expect(errors).toEqual([]);
});

test("demos are isolated and permission requests can be canceled by keyboard", async ({
  page,
}) => {
  await page.goto("/components/voice-input");
  await page.evaluate(() => {
    Object.assign(window, { originalMedia: navigator.mediaDevices });
  });
  await page.getByRole("button", { name: "Try denied microphone" }).click();
  await expect(
    page.getByRole("button", {
      name: "Microphone permission denied",
      exact: true,
    }),
  ).toBeVisible();
  const pending = page.getByRole("button", { name: "Try pending microphone" });
  await pending.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Cancel microphone request" }),
  ).toBeFocused();
  await page.keyboard.press("Space");
  await expect(pending).toBeFocused();
  expect(
    await page.evaluate(
      () =>
        navigator.mediaDevices ===
        (window as unknown as { originalMedia: MediaDevices }).originalMedia,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Try missing microphone" }).click();
  await expect(
    page.getByRole("button", { name: /No microphone found/ }),
  ).toBeVisible();
});

test("records, pauses, resumes, plays, downloads and discards a local take", async ({
  page,
  browserName,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  if (
    browserName === "webkit" ||
    !testInfo.project.use.launchOptions?.args?.includes(
      "--use-fake-device-for-media-stream",
    )
  ) {
    // Deterministic audio source for WebKit, which cannot grant microphone permission headlessly.
    // MediaRecorder, encoding, object URLs and playback remain real browser APIs.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => {
            const context = new AudioContext();
            await context.resume();
            const source = context.createOscillator();
            const destination = context.createMediaStreamDestination();
            source.connect(destination);
            source.start();
            for (const track of destination.stream.getTracks()) {
              const stop = track.stop.bind(track);
              track.stop = () => {
                stop();
                source.disconnect();
                void context.close().catch(() => undefined);
              };
            }
            return destination.stream;
          },
        },
      });
    });
  }
  await page.goto("/components/voice-input");
  // Exercising a fake example must not overwrite the browser's real acquisition API.
  await page.getByRole("button", { name: "Try denied microphone" }).click();
  const recipe = page.getByRole("region", {
    name: "Record, pause, and keep a memo",
    exact: true,
  });
  await recipe
    .getByRole("button", { name: "Record voice memo", exact: true })
    .click();
  await expect(recipe.getByRole("status")).toHaveText("Recording your voice.");
  await expect(recipe.getByRole("timer")).toHaveText("0:01");
  await recipe.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(recipe.getByRole("status")).toHaveText(
    "Paused. Your microphone remains open.",
  );
  const elapsed = await recipe.getByRole("timer").innerText();
  await page.waitForTimeout(1100);
  await expect(recipe.getByRole("timer")).toHaveText(elapsed);
  await recipe.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(recipe.getByRole("status")).toHaveText("Recording your voice.");
  await recipe
    .getByRole("button", { name: "Stop recording", exact: true })
    .click();
  await expect(recipe.getByRole("status")).toHaveText(
    "Your recording is ready.",
  );
  const audio = recipe.locator("audio");
  await expect
    .poll(() => audio.evaluate((node: HTMLAudioElement) => node.readyState))
    .toBeGreaterThan(0);
  await audio.evaluate((node: HTMLAudioElement) => node.play());
  await expect
    .poll(() => audio.evaluate((node: HTMLAudioElement) => node.currentTime))
    .toBeGreaterThan(0);
  const downloadPromise = page.waitForEvent("download");
  await recipe.getByRole("link", { name: "Download", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^voice-memo\.(webm|m4a|ogg)$/);
  expect(await download.failure()).toBeNull();
  await recipe.screenshot({
    path: `test-results/voice-input-${browserName}-ready.png`,
  });
  await recipe.getByRole("button", { name: "Discard", exact: true }).click();
  await expect(audio).toHaveCount(0);
  await expect(recipe.getByRole("timer")).toHaveText("0:00");
  await recipe
    .getByRole("button", { name: "Record voice memo", exact: true })
    .click();
  await expect(
    recipe.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await recipe.getByRole("button", { name: "Discard", exact: true }).click();
  await expect(recipe.getByRole("status")).toHaveText(
    "Ready when you are. Activate the microphone to begin.",
  );
  expect(errors).toEqual([]);
});

test("mobile dark RTL reduced-motion controls remain accessible", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/components/voice-input");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const recipe = page.getByRole("region", {
    name: "Record, pause, and keep a memo",
    exact: true,
  });
  await recipe.scrollIntoViewIfNeeded();
  await expect(
    recipe.getByRole("button", { name: "Record voice memo", exact: true }),
  ).toHaveAttribute("data-reduced-motion", "true");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .include('[aria-labelledby="record-pause-and-keep-a-memo"]')
    .analyze();
  expect(results.violations).toEqual([]);
  await recipe.screenshot({
    path: `test-results/voice-input-${browserName}-mobile.png`,
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(
    recipe.getByRole("button", { name: "Record voice memo", exact: true }),
  ).not.toHaveAttribute("data-reduced-motion", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    recipe.getByRole("button", { name: "Record voice memo", exact: true }),
  ).toHaveAttribute("data-reduced-motion", "true");
});

test("sunlight ring responds to audio and settles in silence and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          const context = new AudioContext();
          await context.resume();
          const source = context.createOscillator();
          const gain = context.createGain();
          gain.gain.value = 0;
          const destination = context.createMediaStreamDestination();
          source.connect(gain).connect(destination);
          source.start();
          Object.assign(window, { voiceTestGain: gain });
          const track = destination.stream.getAudioTracks()[0];
          const stop = track.stop.bind(track);
          track.stop = () => {
            stop();
            void context.close();
          };
          return destination.stream;
        },
      },
    });
  });
  await page.goto("/components/voice-input");
  const recipe = page.getByRole("region", {
    name: "Record, pause, and keep a memo",
    exact: true,
  });
  const button = recipe.locator('[data-slot="voice-input"]');
  const before = await button.boundingBox();
  await button.click();
  await expect(button).toHaveAttribute("data-state", "recording");
  const rays = button.locator('[data-slot="voice-input-wave-bar"]');
  await expect(rays).toHaveCount(24);
  const lengths = () =>
    rays.evaluateAll((nodes) =>
      nodes.map((node) => new DOMMatrix(getComputedStyle(node).transform).m22),
    );
  await expect
    .poll(async () => Math.max(...(await lengths())))
    .toBeCloseTo(0.3, 1);
  const after = await button.boundingBox();
  expect(after!.width).toBeCloseTo(before!.width, 1);
  expect(after!.width).toBeCloseTo(after!.height, 1);
  await page.evaluate(() => {
    (
      window as unknown as { voiceTestGain: GainNode }
    ).voiceTestGain.gain.value = 1;
  });
  await expect
    .poll(async () => Math.max(...(await lengths())))
    .toBeGreaterThan(0.5);
  expect(
    await rays.evaluateAll((nodes) =>
      nodes.every((node) => {
        const ray = node.getBoundingClientRect();
        const control = node.closest("button")!.getBoundingClientRect();
        return (
          ray.left >= control.left &&
          ray.right <= control.right &&
          ray.top >= control.top &&
          ray.bottom <= control.bottom
        );
      }),
    ),
  ).toBe(true);
  await page.evaluate(() => {
    (
      window as unknown as { voiceTestGain: GainNode }
    ).voiceTestGain.gain.value = 0;
  });
  await expect
    .poll(async () => Math.max(...(await lengths())))
    .toBeCloseTo(0.3, 1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => {
    (
      window as unknown as { voiceTestGain: GainNode }
    ).voiceTestGain.gain.value = 1;
  });
  await expect
    .poll(async () => Math.max(...(await lengths())))
    .toBeCloseTo(0.3, 3);
  await button.click();
  await expect(button).toHaveAttribute("data-state", "idle");
});

for (const theme of ["light", "dark"] as const) {
  test(`visual states in ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
    await page.goto("/components/voice-input");
    await page
      .getByRole("button", {
        name: theme === "light" ? "Light theme" : "Dark theme",
        exact: true,
      })
      .click();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    if (theme === "dark") {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => {
        document.documentElement.dir = "rtl";
        document
          .querySelectorAll("[data-dethink-provider]")
          .forEach((node) => node.setAttribute("data-density", "compact"));
      });
    }
    for (const region of [
      "Variants",
      "Sizes",
      "Record, pause, and keep a memo",
    ]) {
      if (region === "Variants" || region === "Sizes") {
        for (const control of await page
          .getByRole("region", { name: region, exact: true })
          .locator('[data-slot="voice-input"]')
          .all()) {
          await control.click();
          await expect(control).toHaveAttribute("data-state", "recording");
        }
      }
      await expect(
        page.getByRole("region", { name: region, exact: true }),
      ).toHaveScreenshot(
        `${theme}-${region.toLowerCase().replaceAll(/[^a-z]+/g, "-")}.png`,
        { animations: "disabled", style: "nextjs-portal { display: none; }" },
      );
    }
  });
}
