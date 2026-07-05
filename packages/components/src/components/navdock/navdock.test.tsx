import { createRef, forwardRef, useState, type MouseEvent } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  CollapseDock,
  NavDock,
  NavDockButton,
  NavDockDivider,
  NavDockItem,
  NavDockLink,
  NavDockList,
  NavDockSeparator,
  NavDockSubmenu,
  NavDockSubmenuContent,
  NavDockSubmenuTrigger,
  navDockButtonClassNames,
  navDockClassNames,
  navDockItemClassNames,
  navDockLinkClassNames,
  navDockListClassNames,
  navDockSeparatorClassNames,
  navDockSubmenuClassNames,
  navDockSubmenuContentClassNames,
  navDockSubmenuTriggerClassNames,
  type NavDockItemData,
  type NavDockPlacement,
  type NavDockPosition,
  type NavDockShowTitle,
  type NavDockSize,
  type NavDockVariant,
} from ".";

const placements: NavDockPlacement[] = ["bottom", "top", "left", "right"];
const positions: NavDockPosition[] = ["static", "absolute", "fixed"];
const variants: NavDockVariant[] = ["default", "glass", "solid"];
const sizes: NavDockSize[] = ["sm", "md", "lg"];
const showTitleModes: NavDockShowTitle[] = ["never", "hover", "always"];

const RouterLink = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterLink.displayName = "RouterLink";

function Icon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M2 8h12" />
    </svg>
  );
}

function getItems(onAction = vi.fn()): NavDockItemData[] {
  return [
    {
      href: "/overview",
      icon: <Icon />,
      title: "Overview",
      value: "overview",
    },
    {
      badge: "3",
      icon: <Icon />,
      onAction,
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
}

function getSubmenuItems(onAction = vi.fn()): NavDockItemData[] {
  return [
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
          badge: "new",
          external: true,
          href: "https://example.com/changelog",
          title: "Changelog",
          value: "changelog",
        },
        {
          kind: "separator",
          value: "separator",
        },
        {
          description: "Refresh local docs.",
          kind: "action",
          onAction,
          title: "Refresh docs",
          value: "refresh",
        },
      ],
      title: "Docs",
      value: "docs",
    },
  ];
}

function ControlledSubmenuDock({
  onOpenValueChange,
}: {
  onOpenValueChange: (value: string | null) => void;
}) {
  const [openValue, setOpenValue] = useState<string | null>(null);

  return (
    <NavDock
      items={getSubmenuItems()}
      onOpenValueChange={(nextValue) => {
        onOpenValueChange(nextValue);
        setOpenValue(nextValue);
      }}
      openValue={openValue}
    />
  );
}

async function withOverflowingDockList(
  callback: () => Promise<void> | void,
) {
  const scrollWidthDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollWidth",
  );
  const clientWidthDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "clientWidth",
  );
  const OriginalResizeObserver = globalThis.ResizeObserver;

  class TestResizeObserver implements ResizeObserver {
    readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    disconnect() {
      return undefined;
    }

    observe(target: Element) {
      this.callback([], this);
      return target;
    }

    unobserve() {
      return undefined;
    }
  }

  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get() {
      return this.getAttribute("data-slot") === "navdock-list" ? 500 : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return this.getAttribute("data-slot") === "navdock-list" ? 100 : 0;
    },
  });
  globalThis.ResizeObserver = TestResizeObserver;

  try {
    await callback();
  } finally {
    if (scrollWidthDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "scrollWidth",
        scrollWidthDescriptor,
      );
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, "scrollWidth");
    }

    if (clientWidthDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "clientWidth",
        clientWidthDescriptor,
      );
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
    }

    globalThis.ResizeObserver = OriginalResizeObserver;
  }
}

async function withAutoCollapseMedia(
  matches: boolean,
  callback: () => Promise<void> | void,
) {
  const originalMatchMedia = window.matchMedia;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: "(max-width: 640px), (pointer: coarse)",
    onchange: null,
    addEventListener: vi.fn(
      (_eventName: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(
      (_eventName: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
    ),
    addListener: vi.fn((listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    }),
    removeListener: vi.fn((listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    }),
    dispatchEvent: vi.fn(() => true),
  } as unknown as MediaQueryList;

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => mediaQueryList),
  });

  try {
    await callback();
  } finally {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  }
}

describe("NavDock", () => {
  it("renders a labelled navigation landmark with list semantics from data", () => {
    render(<NavDock currentValue="overview" items={getItems()} />);

    const nav = screen.getByRole("navigation", { name: "Navigation dock" });

    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveAttribute("data-slot", "navdock");
    expect(nav).toHaveAttribute("data-placement", "bottom");
    expect(nav).toHaveAttribute("data-position", "static");
    expect(nav).toHaveAttribute("data-variant", "default");
    expect(nav).toHaveAttribute("data-size", "md");
    expect(nav).toHaveAttribute("data-orientation", "horizontal");
    expect(nav).toHaveAttribute("data-overflow-axis", "x");
    expect(nav).toHaveAttribute("data-show-title", "hover");
    expect(screen.getByRole("list")).toHaveAttribute("data-slot", "navdock-list");
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
    expect(screen.getByRole("list")).toHaveAttribute("data-overflow-axis", "x");
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("prefers explicit navigation labelling", () => {
    render(<NavDock aria-label="Workspace dock" items={getItems()} />);

    expect(
      screen.getByRole("navigation", { name: "Workspace dock" }),
    ).toBeInTheDocument();
  });

  it("uses aria-labelledby without forcing the default label", () => {
    render(
      <>
        <span id="dock-label">Pinned areas</span>
        <NavDock aria-labelledby="dock-label" items={getItems()} />
      </>,
    );

    const nav = screen.getByRole("navigation", { name: "Pinned areas" });

    expect(nav).not.toHaveAttribute("aria-label");
  });

  it("does not use ARIA menu roles for ordinary dock navigation", () => {
    render(<NavDock items={getItems()} />);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.queryByRole("menubar")).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("renders collapsed mode as a vertical rail with the trigger last", async () => {
    const user = userEvent.setup();

    render(
      <NavDock
        currentValue="overview"
        motion="none"
        placement="top"
        showTitle="always"
      >
        <CollapseDock items={getItems()} />
      </NavDock>,
    );

    const nav = screen.getByRole("navigation");
    const trigger = screen.getByRole("button", {
      name: "Open navigation dock",
    });
    const placeholder = nav.querySelector(
      '[data-slot="navdock-collapse-placeholder"]',
    );
    const shell = nav.querySelector(
      '[data-slot="navdock-collapsed-shell"]',
    ) as HTMLElement;

    expect(nav).toHaveAttribute("data-collapse-active", "true");
    expect(nav).toHaveAttribute("data-collapsed", "true");
    expect(nav).toHaveAttribute("data-placement", "top");
    expect(nav).toHaveAttribute("data-anchor-placement", "bottom");
    expect(nav).toHaveAttribute("data-layout-placement", "left");
    expect(nav).toHaveAttribute("data-orientation", "vertical");
    expect(nav).toHaveAttribute("data-collapse-mode", "always");
    expect(trigger).toHaveAttribute("data-slot", "navdock-collapse-trigger");
    expect(trigger).toHaveAttribute("data-placement", "left");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls");
    expect(trigger).not.toHaveAttribute("data-current");
    expect(placeholder).toHaveClass(
      "min-h-[calc(var(--navdock-item-size)+var(--dt-space-4))]",
    );
    expect(shell).toHaveClass(
      "absolute",
      "bottom-0",
      "left-0",
      "min-w-[calc(var(--navdock-item-size)+var(--dt-space-4))]",
      "p-[var(--dt-space-2)]",
    );
    expect(shell).toHaveAttribute("data-state", "closed");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    await user.click(trigger);

    expect(
      screen.getByRole("button", { name: "Close navigation dock" }),
    ).toHaveAttribute("aria-expanded", "true");
    const list = screen.getByRole("list");
    const closeTrigger = screen.getByRole("button", {
      name: "Close navigation dock",
    });

    expect(list).toHaveAttribute("data-slot", "navdock-list");
    expect(list).toHaveAttribute("data-placement", "left");
    expect(list).toHaveAttribute("data-orientation", "vertical");
    expect(list).toHaveClass("items-center", "p-0");
    expect(closeTrigger).toHaveAttribute("aria-controls", list.id);
    expect(list.querySelector('[data-slot="navdock-item-title"]')).toHaveClass(
      "sr-only",
    );
    expect(
      list.compareDocumentPosition(closeTrigger) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(shell).toHaveAttribute("data-state", "open");
    expect(nav).not.toHaveAttribute("data-collapsed");

    await user.click(closeTrigger);

    await waitFor(() => expect(screen.queryByRole("list")).not.toBeInTheDocument());
    expect(nav).toHaveAttribute("data-collapsed", "true");
  });

  it.each(["absolute", "fixed"] satisfies NavDockPosition[])(
    "preserves %s root positioning in collapsed mode",
    (position) => {
      render(
        <NavDock
          collapseMode="always"
          items={getItems()}
          motion="none"
          position={position}
        />,
      );

      const nav = screen.getByRole("navigation");

      expect(nav).toHaveClass(position);
      expect(nav).not.toHaveClass("relative");
      expect(
        nav.querySelector('[data-slot="navdock-collapsed-shell"]'),
      ).toHaveClass("absolute");
    },
  );

  it("forces data-driven collapsed mode to render as an icon-only rail", () => {
    render(
      <NavDock
        collapseMode="always"
        defaultCollapsed={false}
        items={getItems()}
        motion="none"
        showTitle="always"
      />,
    );

    const nav = screen.getByRole("navigation");
    const list = screen.getByRole("list");

    expect(nav).toHaveAttribute("data-show-title", "always");
    expect(list).toHaveClass("items-center", "p-0");
    expect(list.querySelector('[data-slot="navdock-item-title"]')).toHaveClass(
      "sr-only",
    );
  });

  it("matches collapse trigger aria-controls to a custom composed list id", async () => {
    const user = userEvent.setup();

    render(
      <NavDock motion="none">
        <CollapseDock>
          <NavDockList id="custom-collapse-list">
            <NavDockItem icon={<Icon />} title="Overview" value="overview">
              <NavDockLink href="/overview" />
            </NavDockItem>
          </NavDockList>
        </CollapseDock>
      </NavDock>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation dock" }));

    const list = screen.getByRole("list");
    const trigger = screen.getByRole("button", {
      name: "Close navigation dock",
    });

    expect(list).toHaveAttribute("id", "custom-collapse-list");
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-controls", "custom-collapse-list"),
    );
  });

  it("supports controlled collapsed state without changing touch semantics", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    const onAction = vi.fn();

    const { rerender } = render(
      <NavDock>
        <CollapseDock
          collapsed
          items={getItems(onAction)}
          onCollapsedChange={onCollapsedChange}
        />
      </NavDock>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation dock" }));

    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    rerender(
      <NavDock>
        <CollapseDock
          collapsed={false}
          items={getItems(onAction)}
          onCollapsedChange={onCollapsedChange}
        />
      </NavDock>,
    );

    await user.click(screen.getByRole("button", { name: "Activity" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("supports custom collapsed trigger icon and labels", async () => {
    const user = userEvent.setup();

    render(
      <NavDock>
        <CollapseDock
          collapseLabel="Hide dock"
          items={getItems()}
          triggerIcon={<span data-testid="custom-trigger-icon">custom</span>}
          triggerLabel="Show dock"
        />
      </NavDock>,
    );

    expect(screen.getByRole("button", { name: "Show dock" })).toContainElement(
      screen.getByTestId("custom-trigger-icon"),
    );

    await user.click(screen.getByRole("button", { name: "Show dock" }));

    expect(screen.getByRole("button", { name: "Hide dock" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("collapses expanded responsive docks on Escape and outside click", async () => {
    const user = userEvent.setup();

    render(
      <>
        <NavDock
          collapseMode="always"
          defaultCollapsed={false}
          items={getItems()}
          motion="none"
        />
        <button type="button">Outside action</button>
      </>,
    );

    const trigger = screen.getByRole("button", {
      name: "Close navigation dock",
    });

    expect(screen.getByRole("list")).toBeInTheDocument();

    trigger.focus();
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("list")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Open navigation dock" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Open navigation dock" }));
    expect(screen.getByRole("list")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside action" }));

    await waitFor(() => expect(screen.queryByRole("list")).not.toBeInTheDocument());
  });

  it("uses auto collapsed mode for coarse pointer or compact viewports", async () => {
    await withAutoCollapseMedia(true, async () => {
      render(<NavDock collapseMode="auto" items={getItems()} />);

      await waitFor(() =>
        expect(screen.getByRole("navigation")).toHaveAttribute(
          "data-collapse-active",
          "true",
        ),
      );
      await waitFor(() =>
        expect(screen.queryByRole("list")).not.toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: "Open navigation dock" }),
      ).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("keeps auto mode expanded when responsive collapse is inactive", async () => {
    await withAutoCollapseMedia(false, async () => {
      render(<NavDock collapseMode="auto" items={getItems()} />);

      expect(screen.queryByRole("button", { name: "Open navigation dock" })).toBeNull();
      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).not.toHaveAttribute(
        "data-collapse-active",
      );
    });
  });

  it("ignores collapsed props when collapseMode is none", () => {
    render(<NavDock collapsed collapseMode="none" items={getItems()} />);

    expect(screen.queryByRole("button", { name: "Open navigation dock" })).toBeNull();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-collapse-mode",
      "none",
    );
    expect(screen.getByRole("navigation")).not.toHaveAttribute("data-collapsed");
  });

  it("keeps submenu triggers explicit after collapsed expansion", async () => {
    const user = userEvent.setup();

    render(
      <NavDock>
        <CollapseDock items={getSubmenuItems()} />
      </NavDock>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation dock" }));
    await user.click(screen.getByRole("button", { name: "Docs" }));

    expect(screen.getByRole("button", { name: "Docs" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: /API reference/ })).toBeInTheDocument();
  });

  it("renders data-driven submenu disclosures from child item arrays", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { container } = render(<NavDock items={getSubmenuItems(onAction)} />);

    const trigger = screen.getByRole("button", { name: "Docs" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("API reference")).not.toBeInTheDocument();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).not.toHaveAttribute("aria-haspopup");
    expect(trigger).toHaveAttribute("aria-controls");
    expect(container.querySelector('[data-slot="navdock-submenu"]')).toHaveAttribute(
      "data-state",
      "open",
    );
    expect(
      container.querySelector('[data-slot="navdock-submenu-content"]'),
    ).toHaveAttribute("role", "group");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
    expect(screen.getByText("Resources")).toHaveAttribute(
      "data-slot",
      "navdock-submenu-label",
    );
    expect(screen.getByRole("link", { name: /API reference/ })).toHaveAttribute(
      "href",
      "/docs/api",
    );
    expect(screen.getByRole("link", { name: /Changelog/ })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(
      container.querySelector('[data-slot="navdock-submenu-separator"]'),
    ).toHaveAttribute("role", "presentation");

    await user.click(screen.getByRole("button", { name: /Refresh docs/ }));

    expect(onAction).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByText("API reference")).not.toBeInTheDocument(),
    );
  });

  it("supports controlled submenu open state", async () => {
    const user = userEvent.setup();
    const onOpenValueChange = vi.fn();

    render(<ControlledSubmenuDock onOpenValueChange={onOpenValueChange} />);

    const trigger = screen.getByRole("button", { name: "Docs" });

    await user.hover(trigger);

    expect(onOpenValueChange).toHaveBeenLastCalledWith("docs");
    expect(screen.getByText("API reference")).toBeInTheDocument();

    await user.unhover(trigger);

    await waitFor(() =>
      expect(onOpenValueChange).toHaveBeenLastCalledWith(null),
    );
    await waitFor(() =>
      expect(screen.queryByText("API reference")).not.toBeInTheDocument(),
    );
  });

  it("toggles submenu disclosures closed from the trigger", async () => {
    const user = userEvent.setup();

    render(<NavDock items={getSubmenuItems()} />);

    const trigger = screen.getByRole("button", { name: "Docs" });

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("API reference")).toBeInTheDocument();

    await user.click(trigger);

    await waitFor(() =>
      expect(screen.queryByText("API reference")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens submenu disclosures from focus", async () => {
    render(<NavDock items={getSubmenuItems()} />);

    screen.getByRole("button", { name: "Docs" }).focus();

    await waitFor(() =>
      expect(screen.getByText("API reference")).toBeInTheDocument(),
    );
  });

  it("keeps submenu disclosures open across the pointer gap into the panel", () => {
    vi.useFakeTimers();

    try {
      const { container } = render(
        <NavDock defaultOpenValue="docs" items={getSubmenuItems()} />,
      );
      const submenu = container.querySelector('[data-slot="navdock-submenu"]');
      const content = screen.getByText("API reference").closest(
        '[data-slot="navdock-submenu-content"]',
      );

      expect(submenu).not.toBeNull();
      expect(content).not.toBeNull();

      fireEvent.mouseLeave(submenu as Element);
      fireEvent.mouseEnter(content as Element);
      vi.advanceTimersByTime(150);

      expect(screen.getByText("API reference")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("closes submenu disclosures on Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();

    render(<NavDock defaultOpenValue="docs" items={getSubmenuItems()} />);

    const trigger = screen.getByRole("button", { name: "Docs" });
    const link = screen.getByRole("link", { name: /API reference/ });

    link.focus();

    expect(link).toHaveFocus();

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByText("API reference")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("does not apply dock arrow-key navigation inside submenu panels", async () => {
    const user = userEvent.setup();

    render(<NavDock defaultOpenValue="docs" items={getSubmenuItems()} />);

    const submenuLink = screen.getByRole("link", { name: /API reference/ });

    submenuLink.focus();
    await user.keyboard("{ArrowRight}");

    expect(submenuLink).toHaveFocus();
  });

  it("closes submenu disclosures when clicking outside the dock", async () => {
    const user = userEvent.setup();

    render(
      <>
        <NavDock defaultOpenValue="docs" items={getSubmenuItems()} />
        <button type="button">Outside action</button>
      </>,
    );

    expect(screen.getByText("API reference")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside action" }));

    await waitFor(() =>
      expect(screen.queryByText("API reference")).not.toBeInTheDocument(),
    );
  });

  it("keeps portalled submenu clicks inside the owning dock", async () => {
    await withOverflowingDockList(async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      const { container } = render(
        <NavDock defaultOpenValue="docs" items={getSubmenuItems(onAction)} />,
      );

      await waitFor(() =>
        expect(screen.getByRole("list")).toHaveAttribute(
          "data-overflowing",
          "true",
        ),
      );

      await waitFor(() =>
        expect(
          document.body.querySelector(
            '[data-slot="navdock-submenu-content"][data-portalled="true"]',
          ),
        ).toBeInTheDocument(),
      );
      const submenuContent = document.body.querySelector(
        '[data-slot="navdock-submenu-content"][data-portalled="true"]',
      );
      const nav = screen.getByRole("navigation");

      expect(submenuContent).toHaveAttribute("data-portalled", "true");
      expect(nav.contains(submenuContent)).toBe(false);

      await user.click(screen.getByRole("button", { name: /Refresh docs/ }));

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(container.querySelector('[data-slot="navdock"]')).toBe(nav);
    });
  });

  it("supports compound submenu composition with custom children", async () => {
    const user = userEvent.setup();

    render(
      <NavDock>
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

    await user.click(screen.getByRole("button", { name: "Docs" }));

    expect(screen.getByRole("link", { name: "API reference" })).toHaveAttribute(
      "href",
      "/docs/api",
    );
  });

  it.each(placements)("renders %s placement state", (placement) => {
    render(<NavDock items={getItems()} placement={placement} />);

    const orientation =
      placement === "left" || placement === "right" ? "vertical" : "horizontal";
    const overflowAxis = orientation === "vertical" ? "y" : "x";

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-placement",
      placement,
    );
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-orientation",
      orientation,
    );
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-overflow-axis",
      overflowAxis,
    );
    expect(screen.getByRole("list")).toHaveAttribute("data-placement", placement);
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-orientation",
      orientation,
    );
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-overflow-axis",
      overflowAxis,
    );
  });

  it.each(positions)("renders %s position state", (position) => {
    render(<NavDock items={getItems()} position={position} />);

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-position",
      position,
    );
    expect(screen.getByRole("list")).toHaveAttribute("data-position", position);
  });

  it("applies placement-aware fixed offsets with safe-area insets", () => {
    expect(
      navDockClassNames({ placement: "bottom", position: "fixed" }),
    ).toContain("env(safe-area-inset-bottom)");
    expect(navDockClassNames({ placement: "top", position: "fixed" })).toContain(
      "env(safe-area-inset-top)",
    );
    expect(navDockClassNames({ placement: "left", position: "fixed" })).toContain(
      "env(safe-area-inset-left)",
    );
    expect(navDockClassNames({ placement: "right", position: "fixed" })).toContain(
      "env(safe-area-inset-right)",
    );
  });

  it.each(variants)("renders %s variant state", (variant) => {
    render(<NavDock items={getItems()} variant={variant} />);

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-variant",
      variant,
    );
  });

  it.each(sizes)("renders %s size state", (size) => {
    render(<NavDock items={getItems()} size={size} />);

    expect(screen.getByRole("navigation")).toHaveAttribute("data-size", size);
  });

  it.each(showTitleModes)("renders %s title visibility state", (showTitle) => {
    render(<NavDock items={getItems()} showTitle={showTitle} />);

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-show-title",
      showTitle,
    );
  });

  it("renders link items as anchors and current route state as aria-current", () => {
    render(<NavDock currentValue="overview" items={getItems()} />);

    const link = screen.getByRole("link", { name: "Overview" });

    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/overview");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-current", "true");
    expect(link).toHaveAttribute("data-placement", "bottom");
    expect(link).toHaveAttribute("data-size", "md");
    expect(link).toHaveAttribute("data-variant", "default");
    expect(link).toHaveAttribute("data-motion", "standard");
  });

  it("supports custom current matching without router-specific APIs", () => {
    render(
      <NavDock
        currentValue="/workspaces/acme/overview"
        isItemCurrent={(item, context) =>
          context.currentValue?.includes(item.value) ? "location" : undefined
        }
        items={getItems()}
      />,
    );

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  it("renders action items as buttons and calls onAction", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(<NavDock items={getItems(onAction)} />);

    await user.click(screen.getByRole("button", { name: "Activity" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0][0]).toMatchObject({ value: "activity" });
  });

  it("marks the current action item with aria-current and data-current", () => {
    render(<NavDock currentValue="activity" items={getItems()} />);

    const button = screen.getByRole("button", { name: "Activity" });

    expect(button).toHaveAttribute("aria-current", "true");
    expect(button).toHaveAttribute("data-current", "true");
    expect(
      screen.getByRole("link", { name: "Overview" }),
    ).not.toHaveAttribute("data-current");
  });

  it("keeps disabled items visible but non-activatable", async () => {
    const user = userEvent.setup();
    const linkClick = vi.fn();
    const buttonAction = vi.fn();

    render(
      <NavDock>
        <NavDockList>
          <NavDockItem
            disabled
            disabledReason="Reports are locked."
            icon={<Icon />}
            title="Reports"
            value="reports"
          >
            <NavDockLink disabled href="/reports" onClick={linkClick} />
          </NavDockItem>
          <NavDockItem disabled icon={<Icon />} title="Refresh" value="refresh">
            <NavDockButton disabled onAction={buttonAction} />
          </NavDockItem>
        </NavDockList>
      </NavDock>,
    );

    const link = screen.getByRole("link", { name: "Reports" });
    const button = screen.getByRole("button", { name: "Refresh" });

    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(button).toBeDisabled();

    await user.click(link);
    await user.click(button);

    expect(linkClick).not.toHaveBeenCalled();
    expect(buttonAction).not.toHaveBeenCalled();
  });

  it("applies safe defaults and affordance state to external links", () => {
    render(<NavDock items={getItems()} />);

    const link = screen.getByRole("link", { name: "Status" });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
    expect(link).toHaveAttribute("data-external", "true");
  });

  it("tracks active interaction value from hover and focus", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<NavDock items={getItems()} onValueChange={onValueChange} />);

    const overview = screen.getByRole("link", { name: "Overview" });

    await user.hover(overview);

    expect(onValueChange).toHaveBeenLastCalledWith("overview");
    expect(overview).toHaveAttribute("data-active", "true");
    expect(overview).toHaveAttribute("data-motion-state", "active");

    await user.unhover(overview);

    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(overview).toHaveAttribute("data-motion-state", "idle");
  });

  it("scrolls focused items into view for overflowing docks", () => {
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = Element.prototype.scrollIntoView;

    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    try {
      render(<NavDock items={getItems()} />);

      screen.getByRole("link", { name: "Overview" }).focus();

      expect(scrollIntoView).toHaveBeenCalledWith({
        block: "nearest",
        inline: "nearest",
      });
    } finally {
      Object.defineProperty(Element.prototype, "scrollIntoView", {
        configurable: true,
        value: originalScrollIntoView,
      });
    }
  });

  it("moves focus with horizontal arrow keys in LTR", async () => {
    const user = userEvent.setup();

    render(<NavDock items={getItems()} />);

    const overview = screen.getByRole("link", { name: "Overview" });
    const activity = screen.getByRole("button", { name: "Activity" });
    const status = screen.getByRole("link", { name: "Status" });

    overview.focus();
    await user.keyboard("{ArrowRight}");

    expect(activity).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(status).toHaveFocus();

    await user.keyboard("{ArrowLeft}");

    expect(activity).toHaveFocus();
  });

  it("reverses horizontal arrow movement in RTL", async () => {
    const user = userEvent.setup();

    render(
      <div dir="rtl">
        <NavDock items={getItems()} />
      </div>,
    );

    const overview = screen.getByRole("link", { name: "Overview" });
    const activity = screen.getByRole("button", { name: "Activity" });

    activity.focus();
    await user.keyboard("{ArrowRight}");

    expect(overview).toHaveFocus();

    await user.keyboard("{ArrowLeft}");

    expect(activity).toHaveFocus();
  });

  it("moves focus with vertical arrow keys for left and right placements", async () => {
    const user = userEvent.setup();

    render(<NavDock items={getItems()} placement="left" />);

    const overview = screen.getByRole("link", { name: "Overview" });
    const activity = screen.getByRole("button", { name: "Activity" });

    overview.focus();
    await user.keyboard("{ArrowDown}");

    expect(activity).toHaveFocus();

    await user.keyboard("{ArrowUp}");

    expect(overview).toHaveFocus();
  });

  it("moves focus to the first and last dock items with Home and End", async () => {
    const user = userEvent.setup();

    render(<NavDock items={getItems()} />);

    const overview = screen.getByRole("link", { name: "Overview" });
    const activity = screen.getByRole("button", { name: "Activity" });
    const status = screen.getByRole("link", { name: "Status" });

    activity.focus();
    await user.keyboard("{End}");

    expect(status).toHaveFocus();

    await user.keyboard("{Home}");

    expect(overview).toHaveFocus();
  });

  it("ports hover titles outside overflowing lists", async () => {
    await withOverflowingDockList(async () => {
      const user = userEvent.setup();
      const { container } = render(
        <NavDock items={getItems()} showTitle="hover" />,
      );

      await waitFor(() =>
        expect(screen.getByRole("list")).toHaveAttribute(
          "data-overflowing",
          "true",
        ),
      );

      await user.hover(screen.getByRole("link", { name: "Overview" }));

      await waitFor(() => {
        const hoverTitle = document.body.querySelector(
          '[data-slot="navdock-hover-title"][data-portalled="true"]',
        );

        expect(hoverTitle).toHaveTextContent("Overview");
        expect(container.querySelector('[data-slot="navdock-hover-title"]')).toBeNull();
      });
    });
  });

  it("marks immediate data item neighbors with the neighbor motion state", async () => {
    const user = userEvent.setup();

    render(<NavDock items={getItems()} />);

    const overview = screen.getByRole("link", { name: "Overview" });
    const activity = screen.getByRole("button", { name: "Activity" });
    const billing = screen.getByRole("link", { name: "Billing" });
    const status = screen.getByRole("link", { name: "Status" });

    await user.hover(activity);

    expect(activity).toHaveAttribute("data-motion-state", "active");
    expect(overview).toHaveAttribute("data-motion-state", "neighbor");
    expect(billing).toHaveAttribute("data-motion-state", "neighbor");
    expect(status).toHaveAttribute("data-motion-state", "idle");
    expect(
      activity.querySelector('[data-slot="navdock-item-icon"]'),
    ).toHaveAttribute("data-motion-state", "active");
    expect(
      overview.querySelector('[data-slot="navdock-item-icon"]'),
    ).toHaveAttribute("data-motion-state", "neighbor");
  });

  it("marks immediate compound item neighbors with the neighbor motion state", async () => {
    const user = userEvent.setup();

    render(
      <NavDock>
        <NavDockList>
          <NavDockItem icon={<Icon />} title="Overview" value="overview">
            <NavDockLink href="/overview" />
          </NavDockItem>
          <NavDockItem icon={<Icon />} title="Activity" value="activity">
            <NavDockButton />
          </NavDockItem>
          <NavDockItem icon={<Icon />} title="Settings" value="settings">
            <NavDockLink href="/settings" />
          </NavDockItem>
        </NavDockList>
      </NavDock>,
    );

    const overview = screen.getByRole("link", { name: "Overview" });
    const activity = screen.getByRole("button", { name: "Activity" });
    const settings = screen.getByRole("link", { name: "Settings" });

    await user.hover(activity);

    expect(activity).toHaveAttribute("data-motion-state", "active");
    expect(overview).toHaveAttribute("data-motion-state", "neighbor");
    expect(settings).toHaveAttribute("data-motion-state", "neighbor");
  });

  it("marks active and neighbor visible titles with their motion state", async () => {
    const user = userEvent.setup();

    render(<NavDock items={getItems()} showTitle="always" />);

    const overview = screen.getByRole("link", { name: "Overview" });
    const activity = screen.getByRole("button", { name: "Activity" });
    const billing = screen.getByRole("link", { name: "Billing" });
    const status = screen.getByRole("link", { name: "Status" });

    await user.hover(activity);

    expect(
      activity.querySelector('[data-slot="navdock-item-title"]'),
    ).toHaveAttribute("data-motion-state", "active");
    expect(
      overview.querySelector('[data-slot="navdock-item-title"]'),
    ).toHaveAttribute("data-motion-state", "neighbor");
    expect(
      billing.querySelector('[data-slot="navdock-item-title"]'),
    ).toHaveAttribute("data-motion-state", "neighbor");
    expect(
      status.querySelector('[data-slot="navdock-item-title"]'),
    ).toHaveAttribute("data-motion-state", "idle");
  });

  it("renders hover titles through an animated layer without changing the accessible name", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NavDock items={getItems()} placement="top" showTitle="hover" />,
    );

    const overview = screen.getByRole("link", { name: "Overview" });

    expect(container.querySelector('[data-slot="navdock-hover-title"]')).toBeNull();

    await user.hover(overview);

    const hoverTitle = container.querySelector('[data-slot="navdock-hover-title"]');

    expect(overview).toHaveAccessibleName("Overview");
    expect(hoverTitle).toHaveTextContent("Overview");
    expect(hoverTitle).toHaveAttribute("aria-hidden", "true");
    expect(hoverTitle).toHaveAttribute("data-placement", "top");
  });

  it("exposes motion preset and reduced-motion state", () => {
    render(<NavDock items={getItems()} motion="none" />);

    const nav = screen.getByRole("navigation");
    const overview = screen.getByRole("link", { name: "Overview" });
    const activity = screen.getByRole("button", { name: "Activity" });

    expect(nav).toHaveAttribute("data-motion", "none");
    expect(overview).toHaveAttribute("data-motion-state", "idle");
    expect(overview).toHaveAttribute("data-reduced-motion", "true");
    expect(activity).toHaveAttribute("data-reduced-motion", "true");
  });

  it("supports compound composition and router-link asChild", () => {
    render(
      <NavDock currentValue="router">
        <NavDockList>
          <NavDockItem icon={<Icon />} title="Router" value="router">
            <NavDockLink asChild>
              <RouterLink to="/router">Router</RouterLink>
            </NavDockLink>
          </NavDockItem>
        </NavDockList>
      </NavDock>,
    );

    const link = screen.getByRole("link", { name: "Router" });

    expect(link).toHaveAttribute("href", "/router");
    expect(link).toHaveAttribute("data-current", "true");
    expect(link.querySelector('[data-slot="navdock-item-icon"]')).toBeInTheDocument();
    expect(link.querySelector('[data-slot="navdock-item-title"]')).toHaveTextContent(
      "Router",
    );
  });

  it("renders a decorative separator inside compound lists", () => {
    const { container } = render(
      <NavDock currentValue="overview">
        <NavDockList>
          <NavDockItem icon={<Icon />} title="Overview" value="overview">
            <NavDockLink href="/overview" />
          </NavDockItem>
          <NavDockSeparator />
          <NavDockItem icon={<Icon />} title="Settings" value="settings">
            <NavDockLink href="/settings" />
          </NavDockItem>
        </NavDockList>
      </NavDock>,
    );

    const separator = container.querySelector('[data-slot="navdock-separator"]');

    expect(separator?.tagName).toBe("LI");
    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator).toHaveAttribute("role", "presentation");
    expect(separator).toHaveAttribute("data-orientation", "vertical");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("supports the divider alias for separator composition", () => {
    const { container } = render(
      <NavDock placement="left">
        <NavDockList>
          <NavDockItem icon={<Icon />} title="Overview" value="overview">
            <NavDockLink href="/overview" />
          </NavDockItem>
          <NavDockDivider />
          <NavDockItem icon={<Icon />} title="Settings" value="settings">
            <NavDockLink href="/settings" />
          </NavDockItem>
        </NavDockList>
      </NavDock>,
    );

    const separator = container.querySelector('[data-slot="navdock-separator"]');

    expect(separator).toHaveAttribute("data-placement", "left");
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
  });

  it("forwards refs to root, list, item, link, and button elements", () => {
    const rootRef = createRef<HTMLElement>();
    const listRef = createRef<HTMLUListElement>();
    const itemRef = createRef<HTMLLIElement>();
    const linkRef = createRef<HTMLAnchorElement>();
    const buttonRef = createRef<HTMLButtonElement>();

    render(
      <NavDock ref={rootRef}>
        <NavDockList ref={listRef}>
          <NavDockItem ref={itemRef} icon={<Icon />} title="Docs" value="docs">
            <NavDockLink ref={linkRef} href="/docs" />
          </NavDockItem>
          <NavDockItem icon={<Icon />} title="Refresh" value="refresh">
            <NavDockButton ref={buttonRef} />
          </NavDockItem>
        </NavDockList>
      </NavDock>,
    );

    expect(rootRef.current?.tagName).toBe("NAV");
    expect(listRef.current?.tagName).toBe("UL");
    expect(itemRef.current?.tagName).toBe("LI");
    expect(linkRef.current?.tagName).toBe("A");
    expect(buttonRef.current?.tagName).toBe("BUTTON");
  });

  it("rejects data items with ambiguous roles", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const invalidItems = [
      {
        href: "/bad",
        icon: <Icon />,
        onAction: vi.fn(),
        title: "Bad",
        value: "bad",
      },
    ] as unknown as NavDockItemData[];

    expect(() => render(<NavDock items={invalidItems} />)).toThrow(
      "NavDock item data must define only one of href, onAction, or submenu.",
    );

    const invalidSubmenuItems = [
      {
        href: "/bad",
        icon: <Icon />,
        submenu: [],
        title: "Bad",
        value: "bad",
      },
    ] as unknown as NavDockItemData[];

    expect(() => render(<NavDock items={invalidSubmenuItems} />)).toThrow(
      "NavDock item data must define only one of href, onAction, or submenu.",
    );

    consoleError.mockRestore();
  });

  it("enforces item role exclusivity at the TypeScript boundary", () => {
    const validLink: NavDockItemData = {
      href: "/docs",
      icon: <Icon />,
      title: "Docs",
      value: "docs",
    };
    const validAction: NavDockItemData = {
      icon: <Icon />,
      onAction: () => undefined,
      title: "Refresh",
      value: "refresh",
    };
    const validSubmenu: NavDockItemData = {
      icon: <Icon />,
      submenu: [],
      title: "Docs",
      value: "docs",
    };
    // @ts-expect-error NavDock data items cannot combine href and onAction.
    const invalid: NavDockItemData = {
      href: "/bad",
      icon: <Icon />,
      onAction: () => undefined,
      title: "Bad",
      value: "bad",
    };
    // @ts-expect-error NavDock data items cannot combine href and submenu.
    const invalidSubmenu: NavDockItemData = {
      href: "/bad",
      icon: <Icon />,
      submenu: [],
      title: "Bad",
      value: "bad",
    };

    expect(validLink).toBeTruthy();
    expect(validAction).toBeTruthy();
    expect(validSubmenu).toBeTruthy();
    expect(invalid).toBeTruthy();
    expect(invalidSubmenu).toBeTruthy();
  });

  it("composes consumer classes through helper functions", () => {
    expect(navDockClassNames({ className: "custom" })).toContain("custom");
    expect(navDockListClassNames({ className: "custom" })).toContain("custom");
    expect(navDockItemClassNames({ className: "custom" })).toContain("custom");
    expect(navDockLinkClassNames({ className: "custom" })).toContain("custom");
    expect(navDockButtonClassNames({ className: "custom" })).toContain("custom");
    expect(navDockSeparatorClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(navDockSubmenuClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(navDockSubmenuTriggerClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(navDockSubmenuContentClassNames({ className: "custom" })).toContain(
      "custom",
    );
  });

  it("uses tokenized focus-visible and state selectors", () => {
    const className = navDockLinkClassNames();

    expect(navDockListClassNames()).toContain("overflow-visible");
    expect(navDockListClassNames({ overflowing: true })).toContain(
      "overflow-x-auto",
    );
    expect(navDockListClassNames({ placement: "left", overflowing: true })).toContain(
      "overflow-y-auto",
    );
    expect(navDockListClassNames()).toContain("[scrollbar-width:none]");
    expect(navDockListClassNames()).not.toContain("scroll-smooth");
    expect(className).not.toContain("transform-gpu");
    expect(className).not.toContain("will-change-transform");
    expect(className).toContain("focus-visible:ring-ring");
    expect(className).toContain("focus-visible:ring-offset-background");
    expect(className).toContain("data-[active=true]:z-10");
    expect(className).not.toContain("data-[active=true]:bg-muted");
    expect(className).toContain("data-[current=true]:");
    expect(className).toContain("data-[disabled=true]:opacity-50");
  });

  it("keeps the item surface stationary while icon motion owns scaling", () => {
    render(<NavDock items={getItems()} />);

    const overview = screen.getByRole("link", { name: "Overview" });
    const icon = overview.querySelector('[data-slot="navdock-item-icon"]');

    expect(overview.className).not.toContain("transform-gpu");
    expect(overview.className).not.toContain("will-change-transform");
    expect(icon).toHaveClass("transform-gpu");
    expect(icon).toHaveClass("will-change-transform");
    expect(icon?.className).toContain("data-[reduced-motion=true]:will-change-auto");
  });
});
