import { spawn } from "node:child_process";
import { once } from "node:events";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";

// Run against an independently installed and built consumer, never workspace source.
export async function verifyRegistryRuntime(root, framework, port = 3181) {
  const args =
    framework === "next"
      ? [
          "node_modules/next/dist/bin/next",
          "start",
          "--hostname",
          "127.0.0.1",
          "--port",
          String(port),
        ]
      : [
          "node_modules/vite/bin/vite.js",
          "preview",
          "--host",
          "127.0.0.1",
          "--port",
          String(port),
          "--strictPort",
        ];
  const server = spawn(process.execPath, args, { cwd: root, stdio: "inherit" });
  let serverError;
  server.on("error", (error) => {
    serverError = error;
  });
  let browser;
  try {
    const url = `http://127.0.0.1:${port}`;
    await expect
      .poll(
        async () => {
          if (serverError) throw serverError;
          if (server.exitCode !== null)
            throw new Error(`Consumer server exited: ${server.exitCode}`);
          try {
            return (await fetch(url)).ok;
          } catch {
            return false;
          }
        },
        { timeout: 30_000 },
      )
      .toBe(true);
    browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(url);
    for (const name of ["Preparing workspace", "Syncing records"]) {
      const spinner = page.getByRole("status", { name, exact: true });
      await expect(spinner).toBeVisible();
      expect(
        await spinner.evaluate(
          (element) => element.getAnimations({ subtree: true }).length,
        ),
      ).toBe(0);
    }
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect
      .poll(() =>
        page
          .getByRole("status", { name: "Preparing workspace", exact: true })
          .evaluate(
            (element) => element.getAnimations({ subtree: true }).length,
          ),
      )
      .toBe(2);
    await expect
      .poll(() =>
        page
          .getByRole("status", { name: "Syncing records", exact: true })
          .evaluate(
            (element) => element.getAnimations({ subtree: true }).length,
          ),
      )
      .toBe(2);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Count 0", exact: true }).click();
    const counter = page.getByRole("button", { name: "Count 1", exact: true });
    await expect(counter).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Ready", exact: true }),
    ).toBeVisible();
    const trigger = page.getByRole("button", {
      name: "Open dialog",
      exact: true,
    });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Registry dialog" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
    await page
      .getByRole("button", { name: "Collapse sidebar", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Expand sidebar", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Collapse sidebar", exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/#home$/);
    const css = await counter.evaluate((element) => {
      const style = element.ownerDocument.defaultView.getComputedStyle(element);
      return {
        token: style.getPropertyValue("--dt-color-primary"),
        height: element.getBoundingClientRect().height,
        padding: style.paddingLeft,
      };
    });
    expect(css.token.trim()).not.toBe("");
    expect(css.height).toBeGreaterThan(30);
    expect(parseFloat(css.padding)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    await page.screenshot({ path: join(root, "runtime-smoke.png") });
  } finally {
    try {
      await browser?.close();
    } finally {
      if (
        server.pid &&
        server.exitCode === null &&
        server.signalCode === null
      ) {
        const closed = once(server, "close");
        server.kill("SIGTERM");
        await closed;
      }
    }
  }
}
