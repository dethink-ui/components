import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarTrigger,
} from "../sidebar";
import {
  SidebarShell,
  SidebarShellFooter,
  SidebarShellHeader,
  SidebarShellMain,
  SidebarShellNavigation,
  SidebarShellSkipLink,
  getSidebarShellMotionConfig,
  sidebarShellClassNames,
  sidebarShellHeaderClassNames,
} from ".";

function ShellFixture({
  chrome = "workbench",
  defaultCollapsed = false,
  onCollapsedChange,
  side = "left",
}: {
  chrome?: "workbench" | "plain";
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  side?: "left" | "right";
}) {
  return (
    <SidebarShell
      chrome={chrome}
      defaultCollapsed={defaultCollapsed}
      onCollapsedChange={onCollapsedChange}
      side={side}
    >
      <Sidebar aria-label="Workspace navigation">
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuLink current href="/overview">
                Overview
              </SidebarMenuLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarShellHeader>Command center</SidebarShellHeader>
      <SidebarShellMain>Main content</SidebarShellMain>
      <SidebarShellFooter>All systems operational</SidebarShellFooter>
    </SidebarShell>
  );
}

describe("SidebarShell", () => {
  it("includes the content pane in keyboard navigation without interactive children", async () => {
    const user = userEvent.setup();
    render(
      <SidebarShell aria-label="Workspace">
        <SidebarShellHeader>
          <button type="button">Before content</button>
        </SidebarShellHeader>
        <SidebarShellMain>Scrollable text content</SidebarShellMain>
        <SidebarShellFooter>
          <button type="button">After content</button>
        </SidebarShellFooter>
      </SidebarShell>,
    );
    expect(screen.getByRole("group", { name: "Workspace" })).toBeVisible();
    screen.getByRole("button", { name: "Before content" }).focus();
    await user.tab();
    expect(screen.getByRole("main")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "After content" })).toHaveFocus();
  });

  it("renders semantic shell anatomy with an automatic first skip link", () => {
    const { container } = render(<ShellFixture />);
    const shell = container.querySelector('[data-slot="sidebar-shell"]');
    const frame = container.querySelector('[data-slot="sidebar-shell-frame"]');
    const navigation = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });
    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const footer = screen.getByRole("contentinfo");
    const skipLink = screen.getByRole("link", { name: "Skip to main content" });

    expect(shell).toHaveAttribute("data-layout", "viewport");
    expect(shell).toHaveAttribute("data-chrome", "workbench");
    expect(shell).toHaveAttribute("data-side", "left");
    expect(shell).toHaveAttribute("data-collapsed", "false");
    expect(shell).toHaveAttribute("data-motion", "standard");
    expect(shell?.firstElementChild).toBe(skipLink);
    expect(skipLink).toHaveAttribute("href", `#${main.id}`);
    expect(main).toHaveAttribute("tabindex", "0");
    expect(navigation.parentElement).toBe(shell);
    expect(frame?.parentElement).toBe(shell);
    expect(frame).toContainElement(header);
    expect(frame).toContainElement(main);
    expect(frame).toContainElement(footer);
    expect(container.querySelectorAll("main")).toHaveLength(1);
  });

  it("owns uncontrolled collapsed state and coordinates Sidebar controls", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    const { container } = render(
      <ShellFixture onCollapsedChange={onCollapsedChange} />,
    );
    const shell = container.querySelector('[data-slot="sidebar-shell"]');
    const header = container.querySelector(
      '[data-slot="sidebar-shell-header"]',
    );

    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(shell).toHaveAttribute("data-collapsed", "true");
    expect(header).toHaveAttribute("data-collapsed", "true");
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("preserves controlled collapsed state until the consumer updates it", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    const { container } = render(
      <SidebarShell collapsed={false} onCollapsedChange={onCollapsedChange}>
        <Sidebar>
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
        </Sidebar>
        <SidebarShellMain>Controlled content</SidebarShellMain>
      </SidebarShell>,
    );

    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(
      container.querySelector('[data-slot="sidebar-shell"]'),
    ).toHaveAttribute("data-collapsed", "false");
  });

  it("supports right-side and plain chrome compositions", () => {
    const { container } = render(<ShellFixture chrome="plain" side="right" />);
    const shell = container.querySelector('[data-slot="sidebar-shell"]');
    const frame = container.querySelector('[data-slot="sidebar-shell-frame"]');

    expect(shell).toHaveAttribute("data-side", "right");
    expect(shell).toHaveAttribute("data-chrome", "plain");
    expect(shell).toHaveClass("data-[side=right]:flex-row-reverse");
    expect(frame).toHaveAttribute("data-chrome", "plain");
  });

  it("preserves physical side placement inside compact RTL providers", () => {
    const { container } = render(
      <DethinkProvider data-testid="provider" density="compact" dir="rtl">
        <ShellFixture side="right" />
      </DethinkProvider>,
    );
    const shell = container.querySelector('[data-slot="sidebar-shell"]');

    expect(screen.getByTestId("provider")).toHaveAttribute(
      "data-density",
      "compact",
    );
    expect(screen.getByTestId("provider")).toHaveAttribute("dir", "rtl");
    expect(shell).toHaveClass("rtl:data-[side=left]:flex-row-reverse");
    expect(shell).toHaveClass("rtl:data-[side=right]:flex-row");
    expect(shell?.className).toContain("var(--dt-density-gap)");
    expect(
      container.querySelector('[data-slot="sidebar-shell-header"]')?.className,
    ).toContain("var(--dt-density-control)");
    expect(
      container.querySelector('[data-slot="sidebar-shell-main"]')?.className,
    ).toContain("var(--dt-density-gap)");
    expect(
      container.querySelector('[data-slot="sidebar-shell-footer"]')?.className,
    ).toContain("var(--dt-density-control)");
  });

  it("supports extracted navigation through the explicit Motion region", () => {
    const navigationRef = createRef<HTMLDivElement>();
    const { container } = render(
      <SidebarShell>
        <SidebarShellNavigation ref={navigationRef}>
          <Sidebar aria-label="Extracted navigation" />
        </SidebarShellNavigation>
        <SidebarShellMain>Workspace</SidebarShellMain>
      </SidebarShell>,
    );
    const shell = container.querySelector('[data-slot="sidebar-shell"]');

    expect(navigationRef.current).toHaveAttribute(
      "data-slot",
      "sidebar-shell-navigation",
    );
    expect(navigationRef.current?.parentElement).toBe(shell);
    expect(
      screen.getByRole("navigation", { name: "Extracted navigation" })
        .parentElement,
    ).toBe(navigationRef.current);
  });

  it("supports semantic overrides and a custom skip target", () => {
    render(
      <SidebarShell mainId="workspace-main">
        <Sidebar />
        <SidebarShellSkipLink targetId="custom-main">
          Jump to workspace
        </SidebarShellSkipLink>
        <SidebarShellHeader as="div">Toolbar</SidebarShellHeader>
        <SidebarShellMain
          as="section"
          id="custom-main"
          tabIndex={-1}
          aria-label="Workspace"
        >
          Section content
        </SidebarShellMain>
        <SidebarShellFooter as="div">Status</SidebarShellFooter>
      </SidebarShell>,
    );

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Workspace" })).toHaveAttribute(
      "id",
      "custom-main",
    );
    expect(screen.getByRole("region", { name: "Workspace" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(
      screen.getByRole("link", { name: "Jump to workspace" }),
    ).toHaveAttribute("href", "#custom-main");
  });

  it("wires the automatic skip link to an explicit main identifier", () => {
    render(
      <SidebarShell>
        <Sidebar />
        <SidebarShellMain id="workspace-main">Workspace</SidebarShellMain>
      </SidebarShell>,
    );

    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#workspace-main");
  });

  it("forwards refs and consumer classes to public shell surfaces", () => {
    const shellRef = createRef<HTMLDivElement>();
    const headerRef = createRef<HTMLElement>();
    const mainRef = createRef<HTMLElement>();
    const footerRef = createRef<HTMLElement>();

    render(
      <SidebarShell ref={shellRef} className="custom-shell">
        <Sidebar />
        <SidebarShellHeader ref={headerRef} className="custom-header" />
        <SidebarShellMain ref={mainRef} className="custom-main" />
        <SidebarShellFooter ref={footerRef} className="custom-footer" />
      </SidebarShell>,
    );

    expect(shellRef.current).toHaveClass("custom-shell");
    expect(headerRef.current).toHaveClass("custom-header");
    expect(mainRef.current).toHaveClass("custom-main");
    expect(footerRef.current).toHaveClass("custom-footer");
  });

  it("resolves named Motion presets and disables all movement when requested", () => {
    expect(getSidebarShellMotionConfig("subtle")).toMatchObject({
      motion: "subtle",
      reducedMotion: false,
      surfaceLift: 0.5,
    });
    expect(getSidebarShellMotionConfig("expressive")).toMatchObject({
      motion: "expressive",
      reducedMotion: false,
      tapScale: 0.992,
    });
    expect(getSidebarShellMotionConfig("expressive", true)).toEqual({
      hoverScale: 1,
      motion: "none",
      reducedMotion: true,
      surfaceLift: 0,
      tapScale: 1,
      transition: { duration: 0 },
    });
  });

  it("exposes no-motion state when animation is disabled", () => {
    const { container } = render(
      <SidebarShell animate={false} motion="expressive">
        <Sidebar />
        <SidebarShellMain>Static workspace</SidebarShellMain>
      </SidebarShell>,
    );
    const shell = container.querySelector('[data-slot="sidebar-shell"]');

    expect(shell).toHaveAttribute("data-animate", "false");
    expect(shell).toHaveAttribute("data-motion", "none");
    expect(shell).toHaveAttribute("data-reduced-motion", "true");
  });

  it("keeps shell animation behavior in Motion rather than CSS transitions", () => {
    expect(sidebarShellClassNames()).not.toContain("transition");
    expect(sidebarShellHeaderClassNames()).not.toContain("transition");
  });
});
