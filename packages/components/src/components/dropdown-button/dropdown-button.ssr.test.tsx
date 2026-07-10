import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DropdownMenuItem } from "../dropdown-menu";
import { DropdownButton } from ".";

function ServerDropdownButton() {
  return (
    <DropdownButton label="Server actions" motionPreset="subtle" reducedMotion>
      <DropdownMenuItem>Archive report</DropdownMenuItem>
    </DropdownButton>
  );
}

describe("DropdownButton SSR", () => {
  it("renders stable closed trigger markup without menu content", () => {
    const html = renderToString(<ServerDropdownButton />);

    expect(html).toContain('data-slot="dropdown-button"');
    expect(html).toContain('data-mode="menu"');
    expect(html).toContain('data-state="closed"');
    expect(html).toContain('data-slot="dropdown-button-trigger"');
    expect(html).toContain('data-motion="subtle"');
    expect(html).toContain("Server actions");
    expect(html).not.toContain("Archive report");
  });

  it("renders default-open state without server-rendering a portal surface", () => {
    const html = renderToString(
      <DropdownButton defaultOpen label="Default-open server actions">
        <DropdownMenuItem>Archive report</DropdownMenuItem>
      </DropdownButton>,
    );

    expect(html).toContain('data-state="open"');
    expect(html).toContain('data-open=""');
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain("Archive report");
  });

  it("renders two stable split-button controls on the server", () => {
    const html = renderToString(
      <DropdownButton
        label="Save"
        menuLabel="More save options"
        mode="split"
        onPrimaryAction={() => undefined}
      >
        <DropdownMenuItem>Save as template</DropdownMenuItem>
      </DropdownButton>,
    );

    expect(html).toContain('data-mode="split"');
    expect(html).toContain('data-slot="dropdown-button-primary"');
    expect(html).toContain('data-slot="dropdown-button-menu-trigger"');
    expect(html).toContain('aria-label="More save options"');
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html).not.toContain("Save as template");
  });

  it("renders readable async and independent disabled state on the server", () => {
    const html = renderToString(
      <DropdownButton
        label="Generating report"
        loading
        loadingBehavior="primary"
        menuLabel="More report options"
        mode="split"
        onPrimaryAction={() => undefined}
        reducedMotion
      >
        <DropdownMenuItem>Cancel generation</DropdownMenuItem>
      </DropdownButton>,
    );

    expect(html).toContain('data-loading=""');
    expect(html).toContain('data-loading-behavior="primary"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Generating report");
    expect(html).toContain('data-slot="dropdown-button-busy-indicator"');
    expect(html).not.toContain("animate-spin");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerDropdownButton />);

    await act(async () => {
      hydrateRoot(container, <ServerDropdownButton />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates default-open state before mounting the client portal", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const dropdownButton = (
      <DropdownButton defaultOpen label="Hydrated default-open actions">
        <DropdownMenuItem>Archive report</DropdownMenuItem>
      </DropdownButton>
    );
    container.innerHTML = renderToString(dropdownButton);

    await act(async () => {
      hydrateRoot(container, dropdownButton);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
