import { createRef, forwardRef, type AnchorHTMLAttributes } from "react";
import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupTrigger,
  SidebarHeader,
  SidebarInset,
  SidebarMobile,
  SidebarMobileTrigger,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarRail,
  SidebarSkipLink,
  SidebarTrigger,
  sidebarClassNames,
} from ".";

function stubMatchMedia() {
  const original = Object.getOwnPropertyDescriptor(window, "matchMedia");

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  return () => {
    if (original) {
      Object.defineProperty(window, "matchMedia", original);
    } else {
      delete (window as { matchMedia?: unknown }).matchMedia;
    }
  };
}

const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterLink.displayName = "RouterLink";

function DashboardIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />
    </svg>
  );
}

function renderSidebar({
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
}: {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
} = {}) {
  return render(
    <SidebarProvider
      collapsed={collapsed}
      defaultCollapsed={defaultCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <Sidebar aria-label="Workspace navigation">
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    current
                    href="/dashboard"
                    icon={<DashboardIcon />}
                  >
                    Dashboard
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    badge="12"
                    description="Production incidents"
                    href="/alerts"
                    icon={<DashboardIcon />}
                    shortcut="G A"
                  >
                    Alerts
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink disabled href="/billing">
                    Billing
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton icon={<DashboardIcon />}>
                    Refresh data
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuAction aria-label="Open settings">S</SidebarMenuAction>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>Main content</SidebarInset>
    </SidebarProvider>,
  );
}

describe("Sidebar", () => {
  it("renders semantic sidebar navigation with stable slots", () => {
    renderSidebar();

    const sidebar = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });
    const dashboard = screen.getByRole("link", { name: "Dashboard" });

    expect(sidebar).toHaveAttribute("data-slot", "sidebar");
    expect(sidebar).toHaveAttribute("data-collapsed", "false");
    expect(sidebar).toHaveAttribute("data-side", "left");
    expect(sidebar).toHaveAttribute("data-variant", "default");
    expect(screen.getByText("Platform")).toHaveAttribute(
      "data-slot",
      "sidebar-group-label",
    );
    expect(dashboard).toHaveAttribute("href", "/dashboard");
    expect(dashboard).toHaveAttribute("aria-current", "page");
    expect(dashboard).toHaveAttribute("data-current", "true");
    expect(document.querySelector('[data-slot="sidebar-menu-badge"]')).toHaveTextContent(
      "12",
    );
    expect(screen.getByRole("button", { name: "Refresh data" })).toHaveAttribute(
      "data-slot",
      "sidebar-menu-button",
    );
    expect(screen.getByRole("main")).toHaveAttribute("data-slot", "sidebar-inset");
  });

  it("renders a selection indicator only on current menu items", () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="Indicator navigation">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink current href="/current" icon={<DashboardIcon />}>
                  Current page
                </SidebarMenuLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuLink active href="/active">
                  Active page
                </SidebarMenuLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuLink asChild current>
                  <RouterLink to="/router-current">Router current</RouterLink>
                </SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const currentLink = screen.getByRole("link", { name: "Current page" });
    const activeLink = screen.getByRole("link", { name: "Active page" });
    const routerLink = screen.getByRole("link", { name: "Router current" });
    const indicatorSelector = '[data-slot="sidebar-menu-indicator"]';
    const currentIndicator = currentLink.querySelector(indicatorSelector);

    expect(currentIndicator).not.toBeNull();
    expect(currentIndicator).toHaveAttribute("aria-hidden", "true");
    expect(routerLink.querySelector(indicatorSelector)).not.toBeNull();
    expect(activeLink.querySelector(indicatorSelector)).toBeNull();
    expect(activeLink).toHaveAttribute("data-active", "true");
    expect(activeLink).not.toHaveAttribute("data-current");
  });

  it("keeps accessible names and exposes tooltip metadata while collapsed", () => {
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar aria-label="Collapsed navigation">
          <SidebarContent>
            <SidebarGroup collapsible defaultOpen>
              <SidebarGroupTrigger>Admin</SidebarGroupTrigger>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      badge="8"
                      current
                      href="/reports"
                      icon={<DashboardIcon />}
                    >
                      Reports
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink href="/billing">Billing</SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="/custom"
                      icon={<DashboardIcon />}
                      tooltip="Custom label"
                    >
                      <span>Composed content</span>
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const reports = screen.getByRole("link", { name: /Reports/ });
    const billing = screen.getByRole("link", { name: "Billing" });

    expect(reports).toHaveAttribute("data-sidebar-tooltip", "Reports");
    expect(
      reports.querySelector('[data-slot="sidebar-menu-badge-dot"]'),
    ).not.toBeNull();
    expect(billing.querySelector('[data-slot="sidebar-menu-badge-dot"]')).toBeNull();
    expect(
      billing.querySelector('[data-slot="sidebar-menu-icon-fallback"]'),
    ).toHaveTextContent("B");
    expect(screen.getByRole("link", { name: "Composed content" })).toHaveAttribute(
      "data-sidebar-tooltip",
      "Custom label",
    );
    expect(screen.getByRole("button", { name: "Admin" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("keeps collapsed group triggers focusable when expanded", () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="Expanded navigation">
          <SidebarContent>
            <SidebarGroup collapsible defaultOpen>
              <SidebarGroupTrigger>Admin</SidebarGroupTrigger>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink href="/reports">Reports</SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByRole("button", { name: "Admin" })).not.toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("composes consumer classes and forwards refs", () => {
    const providerRef = createRef<HTMLDivElement>();
    const sidebarRef = createRef<HTMLElement>();

    render(
      <SidebarProvider ref={providerRef} className="custom-provider">
        <Sidebar ref={sidebarRef} className="custom-sidebar" />
      </SidebarProvider>,
    );

    expect(providerRef.current).toHaveClass("custom-provider");
    expect(sidebarRef.current).toHaveClass("custom-sidebar");
    expect(sidebarClassNames({ className: "custom-sidebar" })).toContain(
      "custom-sidebar",
    );
  });

  it("supports uncontrolled collapsed state from trigger and rail", async () => {
    const user = userEvent.setup();

    renderSidebar();

    const sidebar = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });
    const trigger = screen.getByRole("button", { name: "Collapse sidebar" });

    await user.click(trigger);

    expect(sidebar).toHaveAttribute("data-collapsed", "true");
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toHaveAttribute("data-collapsed", "true");

    await user.click(screen.getByRole("button", { name: "Expand sidebar" }));

    expect(sidebar).toHaveAttribute("data-collapsed", "false");
  });

  it("uses local sidebar side override for nested controls", () => {
    render(
      <SidebarProvider side="left">
        <Sidebar aria-label="Right navigation" side="right">
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByRole("navigation", { name: "Right navigation" })).toHaveAttribute(
      "data-side",
      "right",
    );
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toHaveAttribute(
      "data-side",
      "right",
    );
    expect(screen.getByRole("button", { name: "Collapse sidebar rail" })).toHaveAttribute(
      "data-side",
      "right",
    );
  });

  it("treats the rail variant as visually collapsed", () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="Rail variant navigation" variant="rail">
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink href="/rail" icon={<DashboardIcon />}>
                  Rail item
                </SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      screen.getByRole("navigation", { name: "Rail variant navigation" }),
    ).toHaveAttribute("data-collapsed", "true");
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute(
      "data-collapsed",
      "true",
    );
  });

  it("supports controlled collapsed state", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();

    renderSidebar({ collapsed: false, onCollapsedChange });

    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-collapsed",
      "false",
    );
  });

  it("supports an initially collapsed rail", () => {
    renderSidebar({ defaultCollapsed: true });

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-collapsed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("supports uncontrolled collapsible groups", async () => {
    const user = userEvent.setup();

    const routerLinkRef = createRef<HTMLAnchorElement>();

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup collapsible defaultOpen={false}>
              <SidebarGroupTrigger>Admin</SidebarGroupTrigger>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink href="/admin/users">Users</SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Admin" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Users" })).toBeNull();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Users" })).toBeVisible();
  });

  it("supports controlled collapsible groups", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup collapsible open={false} onOpenChange={onOpenChange}>
              <SidebarGroupTrigger>Controlled admin</SidebarGroupTrigger>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink href="/admin/audit">Audit</SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Controlled admin" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("link", { name: "Audit" })).toBeNull();
  });

  it("animates collapsible group close before hiding content", async () => {
    const restoreMatchMedia = stubMatchMedia();
    const user = userEvent.setup();

    try {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup collapsible defaultOpen>
                <SidebarGroupTrigger>Admin</SidebarGroupTrigger>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuLink href="/admin/users">Users</SidebarMenuLink>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      const content = document.querySelector<HTMLElement>(
        '[data-slot="sidebar-group-content"]',
      );

      expect(content).not.toBeNull();
      expect(
        content?.querySelector('[data-slot="sidebar-group-content-inner"]'),
      ).not.toBeNull();

      await user.click(screen.getByRole("button", { name: "Admin" }));

      expect(content).toHaveAttribute("data-open", "false");
      expect(content).not.toHaveAttribute("hidden");

      const transitionEnd = createEvent.transitionEnd(content as HTMLElement);
      Object.defineProperty(transitionEnd, "propertyName", {
        value: "grid-template-rows",
      });
      fireEvent(content as HTMLElement, transitionEnd);

      expect(content).toHaveAttribute("hidden");
    } finally {
      restoreMatchMedia();
    }
  });

  it("animates the mobile drawer out before unmounting", async () => {
    const restoreMatchMedia = stubMatchMedia();
    const user = userEvent.setup();

    try {
      render(
        <SidebarProvider>
          <SidebarMobileTrigger />
          <SidebarMobile label="Animated mobile navigation">
            <SidebarContent>Drawer content</SidebarContent>
          </SidebarMobile>
        </SidebarProvider>,
      );

      await user.click(screen.getByRole("button", { name: "Open sidebar" }));

      const dialog = screen.getByRole("dialog", {
        name: "Animated mobile navigation",
      });

      expect(dialog).toHaveAttribute("data-state", "open");

      await user.keyboard("{Escape}");

      expect(dialog).toHaveAttribute("data-state", "closing");
      expect(screen.getByRole("button", { name: "Open sidebar" })).toHaveFocus();

      const animationEnd = createEvent.animationEnd(dialog);
      Object.defineProperty(animationEnd, "animationName", {
        value: "dt-sidebar-panel-out",
      });
      fireEvent(dialog, animationEnd);

      expect(
        screen.queryByRole("dialog", { name: "Animated mobile navigation" }),
      ).toBeNull();
    } finally {
      restoreMatchMedia();
    }
  });

  it("prevents disabled link activation without removing the accessible item", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink disabled href="/disabled" onClick={onClick}>
                  Disabled reports
                </SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const disabledLink = screen.getByRole("link", { name: "Disabled reports" });

    await user.click(disabledLink);

    expect(disabledLink).toHaveAttribute("aria-disabled", "true");
    expect(disabledLink).toHaveAttribute("data-disabled", "true");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports external links and router composition", () => {
    const routerLinkRef = createRef<HTMLAnchorElement>();

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink external href="https://example.com">
                  External docs
                </SidebarMenuLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuLink asChild current>
                  <RouterLink ref={routerLinkRef} to="/router">
                    Router project
                  </RouterLink>
                </SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByRole("link", { name: "External docs" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "External docs" })).toHaveAttribute(
      "rel",
      expect.stringContaining("noopener"),
    );
    expect(screen.getByRole("link", { name: "Router project" })).toHaveAttribute(
      "href",
      "/router",
    );
    expect(screen.getByRole("link", { name: "Router project" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(routerLinkRef.current).toHaveAttribute("href", "/router");
  });

  it("supports mobile drawer open, Escape close, and focus restore", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <SidebarProvider>
        <SidebarMobileTrigger>Open nav</SidebarMobileTrigger>
        <SidebarMobile label="Mobile navigation">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink href="#mobile">Mobile overview</SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </SidebarMobile>
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Open sidebar" });

    await user.click(trigger);

    const drawer = screen.getByRole("dialog", { name: "Mobile navigation" });

    expect(drawer).toHaveAttribute("data-slot", "sidebar-mobile");
    expect(drawer).toHaveFocus();
    expect(container).toHaveAttribute("inert");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Mobile navigation" })).toBeNull();
    expect(trigger).toHaveFocus();
    expect(container).not.toHaveAttribute("inert");
  });

  it("keeps keyboard focus inside the mobile drawer while it is open", async () => {
    const user = userEvent.setup();

    render(
      <>
        <button type="button">Outside action</button>
        <SidebarProvider>
          <SidebarMobileTrigger />
          <SidebarMobile label="Mobile navigation">
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuLink href="#mobile">Mobile overview</SidebarMenuLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </SidebarMobile>
        </SidebarProvider>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Open sidebar" }));

    const closeButton = document.querySelector(
      '[data-slot="sidebar-mobile-close"]',
    ) as HTMLButtonElement;
    const link = screen.getByRole("link", { name: "Mobile overview" });

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(link).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(link).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Mobile navigation" })).toBeNull();
  });

  it("dismisses the mobile drawer on outside click and link activation", async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider>
        <SidebarMobileTrigger />
        <SidebarMobile label="Mobile navigation">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink href="#mobile">Mobile overview</SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </SidebarMobile>
      </SidebarProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Open sidebar" }));
    await user.click(screen.getByRole("link", { name: "Mobile overview" }));

    expect(screen.queryByRole("dialog", { name: "Mobile navigation" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Open sidebar" }));

    const overlay = document.querySelector('[data-slot="sidebar-mobile-overlay"]');

    expect(overlay).not.toBeNull();

    await user.click(overlay as HTMLElement);

    expect(screen.queryByRole("dialog", { name: "Mobile navigation" })).toBeNull();
  });

  it("supports controlled mobile drawer state", async () => {
    const user = userEvent.setup();
    const onMobileOpenChange = vi.fn();

    render(
      <SidebarProvider mobileOpen={false} onMobileOpenChange={onMobileOpenChange}>
        <SidebarMobileTrigger />
        <SidebarMobile label="Controlled mobile navigation">
          <SidebarContent>Controlled drawer</SidebarContent>
        </SidebarMobile>
      </SidebarProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Open sidebar" }));

    expect(onMobileOpenChange).toHaveBeenCalledWith(true);
    expect(
      screen.queryByRole("dialog", { name: "Controlled mobile navigation" }),
    ).toBeNull();
  });

  it("exposes motion preset state for reduced-motion-safe styling", async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider motion="none">
        <Sidebar aria-label="Motion navigation">
          <SidebarMobileTrigger />
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink current href="/motion">
                  Motion settings
                </SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarMobile label="Motion mobile navigation">
            <SidebarContent>Motion drawer</SidebarContent>
          </SidebarMobile>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByRole("navigation", { name: "Motion navigation" })).toHaveAttribute(
      "data-motion",
      "none",
    );

    await user.click(screen.getByRole("button", { name: "Open sidebar" }));

    expect(
      screen.getByRole("dialog", { name: "Motion mobile navigation" }),
    ).toHaveAttribute("data-motion", "none");
  });

  it("can disable sidebar animations with animate false", async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider animate={false} motion="expressive">
        <Sidebar aria-label="Animation disabled navigation">
          <SidebarMobileTrigger />
          <SidebarContent>Navigation content</SidebarContent>
          <SidebarMobile label="Animation disabled mobile navigation">
            <SidebarContent>Mobile content</SidebarContent>
          </SidebarMobile>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(document.querySelector('[data-slot="sidebar-provider"]')).toHaveAttribute(
      "data-animate",
      "false",
    );
    expect(
      screen.getByRole("navigation", { name: "Animation disabled navigation" }),
    ).toHaveAttribute("data-motion", "none");

    await user.click(screen.getByRole("button", { name: "Open sidebar" }));

    expect(
      screen.getByRole("dialog", {
        name: "Animation disabled mobile navigation",
      }),
    ).toHaveAttribute("data-motion", "none");
    expect(document.querySelector('[data-slot="sidebar-mobile-overlay"]')).toHaveAttribute(
      "data-motion",
      "none",
    );
  });

  it("renders a skip link targeting main content", () => {
    render(<SidebarSkipLink targetId="main-content">Skip navigation</SidebarSkipLink>);

    expect(screen.getByRole("link", { name: "Skip navigation" })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });
});
