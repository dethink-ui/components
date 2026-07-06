import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteDialog,
  CommandPaletteTrigger,
} from ".";

const commands = [
  { key: "create", label: "Create project" },
  { key: "settings", label: "Open settings", href: "/settings" },
  {
    disabled: true,
    disabledReason: "Requires owner access",
    key: "delete",
    label: "Delete workspace",
  },
];

describe("CommandPalette SSR", () => {
  it("renders inline command markup on the server", () => {
    const html = renderToString(
      <CommandPalette label="Command menu" commands={commands} />,
    );

    expect(html).toContain('data-slot="command-palette"');
    expect(html).toContain('data-slot="command-palette-input"');
    expect(html).toContain("Create project");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <CommandPalette label="Command menu" commands={commands} />,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <CommandPalette label="Command menu" commands={commands} />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("renders async idle sources on the server", () => {
    const html = renderToString(
      <CommandPalette
        label="Command menu"
        commands={commands}
        recentCommands={[{ key: "recent-settings", label: "Recent settings" }]}
        suggestedCommands={[{ key: "suggested-invite", label: "Invite teammate" }]}
        asyncCommands={[{ key: "remote-project", label: "Remote project" }]}
        shouldFilter={false}
      />,
    );

    expect(html).toContain('data-source="recent"');
    expect(html).toContain('data-source="suggested"');
    expect(html).toContain('data-source="async"');
    expect(html).toContain('data-slot="command-palette-announcer"');
  });

  it("hydrates grouped sources and motion hooks without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const palette = (
      <CommandPalette
        label="Command menu"
        motionPreset="expressive"
        selectedKey="recent-settings"
        commands={[
          { group: "Actions", key: "create", label: "Create project" },
          { group: "Navigate", key: "settings", label: "Open settings" },
        ]}
        recentCommands={[{ key: "recent-settings", label: "Recent settings" }]}
        suggestedCommands={[{ key: "suggested-invite", label: "Invite teammate" }]}
        asyncCommands={[{ key: "remote-project", label: "Remote project" }]}
        shouldFilter={false}
      />
    );
    container.innerHTML = renderToString(palette);

    expect(container.innerHTML).toContain('data-motion="expressive"');
    expect(container.innerHTML).toContain('data-source="recent"');
    expect(container.innerHTML).toContain('data-source="suggested"');
    expect(container.innerHTML).toContain('data-source="async"');
    expect(container.innerHTML).toContain('data-slot="command-palette-motion-result"');
    expect(container.innerHTML).toContain('data-slot="command-palette-selected-indicator"');

    await act(async () => {
      hydrateRoot(container, palette);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("renders nested page stack markup on the server", () => {
    const html = renderToString(
      <CommandPalette
        label="Command menu"
        commands={[
          {
            key: "projects",
            label: "Projects",
            page: "projects",
            type: "page",
          },
        ]}
        pageStack={["projects"]}
        pages={[
          {
            commands: [{ key: "alpha", label: "Open Alpha" }],
            id: "projects",
            title: "Projects",
          },
        ]}
      />,
    );

    expect(html).toContain('data-slot="command-palette-page-stack"');
    expect(html).toContain('data-slot="command-palette-page"');
    expect(html).toContain('data-slot="command-palette-page-header"');
    expect(html).toContain('data-slot="command-palette-page-back"');
    expect(html).toContain('data-page="projects"');
    expect(html).toContain("Open Alpha");
  });

  it("hydrates async idle sources without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const palette = (
      <CommandPalette
        label="Command menu"
        commands={commands}
        recentCommands={[{ key: "recent-settings", label: "Recent settings" }]}
        suggestedCommands={[{ key: "suggested-invite", label: "Invite teammate" }]}
        asyncCommands={[{ key: "remote-project", label: "Remote project" }]}
        shouldFilter={false}
      />
    );
    container.innerHTML = renderToString(palette);

    await act(async () => {
      hydrateRoot(container, palette);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates nested page stacks without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const palette = (
      <CommandPalette
        label="Command menu"
        commands={[
          {
            key: "projects",
            label: "Projects",
            page: "projects",
            type: "page",
          },
        ]}
        pageStack={["projects"]}
        pages={[
          {
            commands: [{ key: "alpha", label: "Open Alpha" }],
            id: "projects",
            title: "Projects",
          },
        ]}
      />
    );
    container.innerHTML = renderToString(palette);

    await act(async () => {
      hydrateRoot(container, palette);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("renders closed dialog shell on the server", () => {
    const html = renderToString(
      <CommandPaletteDialog>
        <CommandPaletteTrigger>Open command menu</CommandPaletteTrigger>
        <CommandPaletteContent title="Command menu">
          <CommandPalette label="Command menu" commands={commands} />
        </CommandPaletteContent>
      </CommandPaletteDialog>,
    );

    expect(html).toContain('data-slot="command-palette-dialog"');
    expect(html).toContain('data-slot="command-palette-trigger"');
    expect(html).toContain("Open command menu");
    expect(html).not.toContain('data-slot="command-palette-content"');
  });

  it("hydrates a closed dialog shell without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const dialog = (
      <CommandPaletteDialog>
        <CommandPaletteTrigger>Open command menu</CommandPaletteTrigger>
        <CommandPaletteContent title="Command menu">
          <CommandPalette label="Command menu" commands={commands} />
        </CommandPaletteContent>
      </CommandPaletteDialog>
    );
    container.innerHTML = renderToString(dialog);

    await act(async () => {
      hydrateRoot(container, dialog);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
