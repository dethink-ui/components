import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  CollapseDock,
  NavDock,
  NavDockItem,
  NavDockLink,
  NavDockList,
  NavDockSubmenu,
  NavDockSubmenuContent,
  NavDockSubmenuTrigger,
  type NavDockItemData,
} from ".";

function Icon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M2 8h12" />
    </svg>
  );
}

const items: NavDockItemData[] = [
  {
    href: "/overview",
    icon: <Icon />,
    title: "Overview",
    value: "overview",
  },
  {
    icon: <Icon />,
    onAction: () => undefined,
    title: "Refresh",
    value: "refresh",
  },
];

const submenuItems: NavDockItemData[] = [
  {
    href: "/overview",
    icon: <Icon />,
    title: "Overview",
    value: "overview",
  },
  {
    icon: <Icon />,
    submenu: [
      {
        href: "/docs/api",
        title: "API reference",
        value: "api",
      },
    ],
    title: "Docs",
    value: "docs",
  },
];

describe("NavDock SSR", () => {
  it("renders data-driven dock markup on the server", () => {
    const markup = renderToString(
      <NavDock currentValue="overview" items={items} />,
    );

    expect(markup).toContain('data-slot="navdock"');
    expect(markup).toContain('data-slot="navdock-list"');
    expect(markup).toContain('aria-current="page"');
  });

  it("renders compound dock markup on the server", () => {
    const markup = renderToString(
      <NavDock>
        <NavDockList>
          <NavDockItem icon={<Icon />} title="Docs" value="docs">
            <NavDockLink href="/docs" />
          </NavDockItem>
        </NavDockList>
      </NavDock>,
    );

    expect(markup).toContain('href="/docs"');
    expect(markup).toContain("Docs");
  });

  it("renders open data-driven submenu markup on the server", () => {
    const markup = renderToString(
      <NavDock defaultOpenValue="docs" items={submenuItems} />,
    );

    expect(markup).toContain('data-slot="navdock-submenu-trigger"');
    expect(markup).toContain('data-slot="navdock-submenu-content"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("API reference");
  });

  it("renders open compound submenu markup on the server", () => {
    const markup = renderToString(
      <NavDock defaultOpenValue="docs">
        <NavDockList>
          <NavDockItem icon={<Icon />} title="Docs" value="docs">
            <NavDockSubmenu>
              <NavDockSubmenuTrigger />
              <NavDockSubmenuContent>
                <a href="/docs/api">API reference</a>
              </NavDockSubmenuContent>
            </NavDockSubmenu>
          </NavDockItem>
        </NavDockList>
      </NavDock>,
    );

    expect(markup).toContain('data-slot="navdock-submenu-content"');
    expect(markup).toContain('href="/docs/api"');
  });

  it("renders collapsed responsive dock markup on the server", () => {
    const markup = renderToString(
      <NavDock currentValue="overview">
        <CollapseDock items={items} />
      </NavDock>,
    );

    expect(markup).toContain('data-collapse-active="true"');
    expect(markup).toContain('data-collapsed="true"');
    expect(markup).toContain('data-slot="navdock-collapse-trigger"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain('data-slot="navdock-list"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <NavDock currentValue="overview" items={items} />,
    );

    await act(async () => {
      hydrateRoot(container, <NavDock currentValue="overview" items={items} />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates collapsed responsive markup without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <NavDock currentValue="overview">
        <CollapseDock items={items} />
      </NavDock>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <NavDock currentValue="overview">
          <CollapseDock items={items} />
        </NavDock>,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
