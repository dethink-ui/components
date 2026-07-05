import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuFeaturedItem,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuSeparator,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuContentClassNames,
  navigationMenuFeaturedItemClassNames,
  navigationMenuTriggerClassNames,
  navigationMenuViewportClassNames,
  type NavigationMenuProps,
} from ".";

function FlyoutNav(props: Partial<NavigationMenuProps>) {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuSection>
              <NavigationMenuLabel>Platform</NavigationMenuLabel>
              <NavigationMenuLink href="/analytics">Analytics</NavigationMenuLink>
              <NavigationMenuLink href="/automation">
                Automation
              </NavigationMenuLink>
            </NavigationMenuSection>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuSection>
              <NavigationMenuLink href="/docs">Documentation</NavigationMenuLink>
            </NavigationMenuSection>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="pricing">
          <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ControlledFlyoutNav({
  onValueChange,
}: {
  onValueChange?: (value: string | null) => void;
}) {
  const [value, setValue] = useState<string | null>(null);

  return (
    <FlyoutNav
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
    />
  );
}

describe("NavigationMenuTrigger", () => {
  it("renders a disclosure button with collapsed state by default", () => {
    render(<FlyoutNav />);

    const trigger = screen.getByRole("button", { name: "Products" });

    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-haspopup");
    expect(trigger).toHaveAttribute("data-slot", "navigation-menu-trigger");
    expect(trigger).toHaveAttribute("data-state", "closed");
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("renders an accessible chevron that can be disabled", () => {
    const { rerender } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByRole("button", { name: "Products" });

    expect(
      trigger.querySelector('[data-slot="navigation-menu-trigger-icon"]'),
    ).toHaveAttribute("aria-hidden", "true");

    rerender(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger showChevron={false}>
              Products
            </NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(
      screen
        .getByRole("button", { name: "Products" })
        .querySelector('[data-slot="navigation-menu-trigger-icon"]'),
    ).not.toBeInTheDocument();
  });

  it("opens and closes the panel on click with disclosure semantics", async () => {
    const user = userEvent.setup();

    render(<FlyoutNav />);

    const trigger = screen.getByRole("button", { name: "Products" });

    await user.click(trigger);

    const panel = screen.getByText("Analytics").closest(
      '[data-slot="navigation-menu-content"]',
    );

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(panel).not.toBeNull();
    expect(trigger).toHaveAttribute("aria-controls", panel?.getAttribute("id") ?? "");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("keeps a single panel open when switching triggers", async () => {
    const user = userEvent.setup();

    render(<FlyoutNav />);

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(screen.getByText("Analytics")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Resources" }));

    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
    expect(screen.getByText("Documentation")).toBeInTheDocument();
  });

  it("hides exiting panels from keyboard and assistive technology while animating out", async () => {
    const user = userEvent.setup();
    const originalGetComputedStyle = window.getComputedStyle;
    const getComputedStyle = vi
      .spyOn(window, "getComputedStyle")
      .mockImplementation((element) => {
        const styles = originalGetComputedStyle(element);

        if (
          element instanceof HTMLElement &&
          element.getAttribute("data-slot") === "navigation-menu-content" &&
          element.getAttribute("data-state") === "closed"
        ) {
          return Object.create(styles, {
            animationName: {
              configurable: true,
              value: "dt-nav-slide-out",
            },
          }) as CSSStyleDeclaration;
        }

        return styles;
      });

    try {
      render(<FlyoutNav />);

      await user.click(screen.getByRole("button", { name: "Products" }));

      const productsPanel = screen
        .getByText("Analytics")
        .closest('[data-slot="navigation-menu-content"]');

      await user.click(screen.getByRole("button", { name: "Resources" }));

      expect(productsPanel).toHaveAttribute("data-state", "closed");
      expect(productsPanel).toHaveAttribute("aria-hidden", "true");
      expect(productsPanel).toHaveAttribute("inert");
      expect(screen.queryByRole("link", { name: "Analytics" })).toBeNull();

      const resourcesPanel = screen
        .getByText("Documentation")
        .closest('[data-slot="navigation-menu-content"]');

      expect(resourcesPanel).not.toHaveAttribute("aria-hidden");
      expect(resourcesPanel).not.toHaveAttribute("inert");

      await act(async () => {
        fireEvent.animationEnd(productsPanel as HTMLElement);
      });

      expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
    } finally {
      getComputedStyle.mockRestore();
    }
  });

  it("does not use ARIA menu roles for open flyout navigation", async () => {
    const user = userEvent.setup();

    render(<FlyoutNav />);

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.queryByRole("menubar")).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("supports uncontrolled default open state", () => {
    render(<FlyoutNav defaultValue="products" />);

    expect(screen.getByRole("button", { name: "Products" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("supports controlled open state with change callbacks", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<FlyoutNav value={null} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(onValueChange).toHaveBeenCalledWith("products");
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("updates a controlled wrapper through the change callback", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<ControlledFlyoutNav onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(onValueChange).toHaveBeenLastCalledWith("products");
    expect(screen.getByText("Analytics")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("closes on Escape and restores focus to the open trigger", async () => {
    const user = userEvent.setup();

    render(<FlyoutNav />);

    const trigger = screen.getByRole("button", { name: "Products" });

    await user.click(trigger);
    await user.tab();

    expect(screen.getByRole("link", { name: "Analytics" })).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes when clicking outside the navigation", async () => {
    const user = userEvent.setup();

    render(
      <>
        <FlyoutNav />
        <button type="button">Outside action</button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(screen.getByText("Analytics")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside action" }));

    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("closes when focus leaves the navigation", async () => {
    const user = userEvent.setup();

    render(
      <>
        <FlyoutNav />
        <button type="button">After nav</button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Products" }));
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();

    expect(screen.getByRole("button", { name: "After nav" })).toHaveFocus();
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("keeps the panel open while focus moves into panel links", async () => {
    const user = userEvent.setup();

    render(<FlyoutNav />);

    await user.click(screen.getByRole("button", { name: "Products" }));
    await user.tab();
    await user.tab();

    expect(screen.getByRole("link", { name: "Automation" })).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "Products" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("ignores activation in manual mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<FlyoutNav activationMode="manual" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("opens on focus in focus activation mode", async () => {
    const user = userEvent.setup();

    render(<FlyoutNav activationMode="focus" />);

    await user.tab();

    expect(screen.getByRole("button", { name: "Products" })).toHaveFocus();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });
});

describe("NavigationMenu hover activation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function advanceTimersByTime(ms: number) {
    await act(async () => {
      vi.advanceTimersByTime(ms);
    });
  }

  it("opens after the intent delay and closes after the close delay", async () => {
    render(<FlyoutNav activationMode="hover" delay={150} closeDelay={300} />);

    const trigger = screen.getByRole("button", { name: "Products" });
    const item = trigger.closest("li") as HTMLLIElement;

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });

    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();

    await advanceTimersByTime(150);

    expect(screen.getByText("Analytics")).toBeInTheDocument();

    fireEvent.pointerLeave(item, {
      pointerType: "mouse",
      relatedTarget: document.body,
    });

    expect(screen.getByText("Analytics")).toBeInTheDocument();

    await advanceTimersByTime(300);

    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("cancels a pending hover open when the pointer leaves early", async () => {
    render(<FlyoutNav activationMode="hover" delay={150} />);

    const trigger = screen.getByRole("button", { name: "Products" });
    const item = trigger.closest("li") as HTMLLIElement;

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    fireEvent.pointerLeave(item, {
      pointerType: "mouse",
      relatedTarget: document.body,
    });

    await advanceTimersByTime(1000);

    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("keeps the panel open while the pointer re-enters before the close delay", async () => {
    render(<FlyoutNav activationMode="hover" delay={150} closeDelay={300} />);

    const trigger = screen.getByRole("button", { name: "Products" });
    const item = trigger.closest("li") as HTMLLIElement;

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    await advanceTimersByTime(150);
    fireEvent.pointerLeave(item, {
      pointerType: "mouse",
      relatedTarget: document.body,
    });
    await advanceTimersByTime(200);
    fireEvent.pointerEnter(item, { pointerType: "mouse" });
    await advanceTimersByTime(1000);

    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("still toggles on click while hover activation is enabled", async () => {
    render(<FlyoutNav activationMode="hover" />);

    fireEvent.click(screen.getByRole("button", { name: "Products" }));

    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });
});

describe("NavigationMenu rich panels", () => {
  it("renders section, label, description, separator, and featured anatomy", async () => {
    const user = userEvent.setup();

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuFeaturedItem href="/platform">
                Platform overview
                <NavigationMenuDescription>
                  One place for analytics, automation, and reporting.
                </NavigationMenuDescription>
              </NavigationMenuFeaturedItem>
              <NavigationMenuSeparator orientation="vertical" />
              <NavigationMenuSection>
                <NavigationMenuLabel>Platform</NavigationMenuLabel>
                <NavigationMenuLink
                  href="/analytics"
                  icon={<svg viewBox="0 0 16 16" />}
                >
                  Analytics
                  <NavigationMenuDescription>
                    Usage dashboards for every workspace.
                  </NavigationMenuDescription>
                </NavigationMenuLink>
                <NavigationMenuLink disabled href="/billing">
                  Billing
                </NavigationMenuLink>
                <NavigationMenuLink external href="https://status.example.com">
                  Status
                </NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Products" }));

    const content = document.querySelector(
      '[data-slot="navigation-menu-content"]',
    );

    expect(content).not.toBeNull();
    expect(
      document.querySelector('[data-slot="navigation-menu-section"]'),
    ).not.toBeNull();
    expect(screen.getByText("Platform")).toHaveAttribute(
      "data-slot",
      "navigation-menu-label",
    );
    expect(
      screen.getByText("Usage dashboards for every workspace."),
    ).toHaveAttribute("data-slot", "navigation-menu-description");
    expect(
      document.querySelector(
        '[data-slot="navigation-menu-separator"][data-orientation="vertical"]',
      ),
    ).toHaveAttribute("aria-hidden", "true");

    const featured = screen.getByRole("link", { name: /Platform overview/ });

    expect(featured).toHaveAttribute(
      "data-slot",
      "navigation-menu-featured-item",
    );
    expect(featured).toHaveAttribute("href", "/platform");
  });

  it("switches panel links to rich layout with icons and text wrapping", async () => {
    const user = userEvent.setup();

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink
                href="/analytics"
                icon={<svg data-testid="analytics-icon" viewBox="0 0 16 16" />}
              >
                Analytics
                <NavigationMenuDescription>
                  Usage dashboards.
                </NavigationMenuDescription>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Products" }));

    const link = screen.getByRole("link", { name: /Analytics/ });
    const icon = link.querySelector(
      '[data-slot="navigation-menu-link-icon"]',
    );

    expect(link).toHaveAttribute("data-panel", "true");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(
      link.querySelector('[data-slot="navigation-menu-link-text"]'),
    ).not.toBeNull();
  });

  it("supports disabled and external links inside panels", async () => {
    const user = userEvent.setup();

    render(<FlyoutNav />);

    await user.click(screen.getByRole("button", { name: "Products" }));

    const automation = screen.getByRole("link", { name: "Automation" });

    expect(automation).toHaveAttribute("data-panel", "true");
    expect(automation).toHaveAttribute("href", "/automation");
  });

  it("keeps the panel open when clicking non-interactive panel content", async () => {
    const user = userEvent.setup();

    render(<FlyoutNav />);

    await user.click(screen.getByRole("button", { name: "Products" }));
    await user.click(screen.getByText("Platform"));

    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("supports asChild composition for featured items", async () => {
    const user = userEvent.setup();

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuFeaturedItem asChild>
                <a href="/platform">Platform overview</a>
              </NavigationMenuFeaturedItem>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Products" }));

    const featured = screen.getByRole("link", { name: "Platform overview" });

    expect(featured).toHaveAttribute("href", "/platform");
    expect(featured).toHaveAttribute(
      "data-slot",
      "navigation-menu-featured-item",
    );
  });
});

describe("NavigationMenuViewport", () => {
  it("hosts the open panel inside the shared viewport", async () => {
    const user = userEvent.setup();

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/analytics">Analytics</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>,
    );

    const viewport = document.querySelector(
      '[data-slot="navigation-menu-viewport"]',
    );

    expect(viewport).toHaveAttribute("data-state", "closed");

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(viewport).toHaveAttribute("data-state", "open");
    expect(
      viewport?.querySelector('[data-slot="navigation-menu-content"]'),
    ).not.toBeNull();
    expect(screen.getByRole("link", { name: "Analytics" })).toBeInTheDocument();
  });
});

describe("NavigationMenu flyout class helpers", () => {
  it("merges consumer classes after baseline classes", () => {
    expect(navigationMenuTriggerClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(navigationMenuContentClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(navigationMenuViewportClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(
      navigationMenuFeaturedItemClassNames({ className: "custom" }),
    ).toContain("custom");
  });

  it("omits inline positioning classes for viewport-hosted panels", () => {
    expect(navigationMenuContentClassNames({ inline: true })).toContain(
      "absolute",
    );
    expect(navigationMenuContentClassNames({ inline: false })).not.toContain(
      "absolute",
    );
  });
});
