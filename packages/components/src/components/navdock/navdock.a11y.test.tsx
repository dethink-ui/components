import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { CollapseDock, NavDock, type NavDockItemData } from ".";

expect.extend(toHaveNoViolations);

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
    onAction: vi.fn(),
    title: "Activity",
    value: "activity",
  },
  {
    disabled: true,
    disabledReason: "Billing is available to workspace owners.",
    href: "/billing",
    icon: <Icon />,
    title: "Billing",
    value: "billing",
  },
  {
    external: true,
    href: "https://status.example.com",
    icon: <Icon />,
    title: "Status",
    value: "status",
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
        kind: "label",
        title: "Resources",
        value: "resources",
      },
      {
        description: "Component and token details.",
        href: "/docs/api",
        title: "API reference",
        value: "api",
      },
      {
        kind: "action",
        onAction: vi.fn(),
        title: "Refresh docs",
        value: "refresh",
      },
    ],
    title: "Docs",
    value: "docs",
  },
];

describe("NavDock accessibility", () => {
  it("has no axe violations for core link and action patterns", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="NavDock accessibility smoke">
          <NavDock
            aria-label="Workspace dock"
            currentValue="overview"
            items={items}
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for open submenu disclosures", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="NavDock submenu accessibility smoke">
          <NavDock
            aria-label="Workspace dock"
            defaultOpenValue="docs"
            items={submenuItems}
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for collapsed responsive docks", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="NavDock collapsed accessibility smoke">
          <NavDock
            aria-label="Workspace dock"
            currentValue="overview"
          >
            <CollapseDock items={items} />
          </NavDock>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
