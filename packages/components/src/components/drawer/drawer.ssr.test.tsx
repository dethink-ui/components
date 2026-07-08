import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from ".";

function ServerDrawer() {
  return (
    <Drawer direction="right">
      <DrawerTrigger>Open server drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Server drawer</DrawerTitle>
          <DrawerDescription>
            Hydrates without mismatch warnings.
          </DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}

function ServerPushDrawer() {
  return (
    <Drawer direction="left" modal={false}>
      <DrawerTrigger>Open server push drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Server push drawer</DrawerTitle>
          <DrawerDescription>
            Push mode hydrates without mismatch warnings.
          </DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}

describe("Drawer SSR (modal mode)", () => {
  it("renders trigger markup on the server", () => {
    const html = renderToString(<ServerDrawer />);

    expect(html).toContain('data-slot="drawer"');
    expect(html).toContain('data-slot="drawer-trigger"');
    expect(html).toContain("Open server drawer");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerDrawer />);

    await act(async () => {
      hydrateRoot(container, <ServerDrawer />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});

describe("Drawer SSR (push mode)", () => {
  it("renders trigger and closed inline content markup on the server", () => {
    const html = renderToString(<ServerPushDrawer />);

    expect(html).toContain('data-slot="drawer"');
    expect(html).toContain('data-slot="drawer-trigger"');
    expect(html).toContain('data-slot="drawer-content"');
    expect(html).toContain('data-state="closed"');
    expect(html).toContain("Open server push drawer");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerPushDrawer />);

    await act(async () => {
      hydrateRoot(container, <ServerPushDrawer />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
