import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarMobile,
  SidebarMobileTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarRail,
} from ".";

function SidebarExample({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <SidebarProvider defaultCollapsed={collapsed}>
      <Sidebar aria-label="SSR navigation">
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuLink current href="/overview">
                Overview
              </SidebarMenuLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}

describe("Sidebar SSR", () => {
  it("renders expanded and collapsed markup on the server", () => {
    const expandedMarkup = renderToString(<SidebarExample />);
    const collapsedMarkup = renderToString(<SidebarExample collapsed />);

    expect(expandedMarkup).toContain('data-slot="sidebar"');
    expect(expandedMarkup).toContain('data-slot="sidebar-viewport"');
    expect(expandedMarkup).toContain('data-slot="sidebar-rail-handle"');
    expect(expandedMarkup).toContain('data-collapsed="false"');
    expect(expandedMarkup).toContain('aria-current="page"');
    expect(collapsedMarkup).toContain('data-collapsed="true"');
  });

  it("renders mobile-capable markup on the server", () => {
    const closedMarkup = renderToString(
      <SidebarProvider>
        <SidebarMobileTrigger />
        <SidebarMobile label="Mobile SSR navigation">
          <SidebarContent>Mobile links</SidebarContent>
        </SidebarMobile>
      </SidebarProvider>,
    );
    const openMarkup = renderToString(
      <SidebarProvider defaultMobileOpen>
        <SidebarMobileTrigger />
        <SidebarMobile label="Mobile SSR navigation">
          <SidebarContent>Mobile links</SidebarContent>
        </SidebarMobile>
      </SidebarProvider>,
    );

    expect(closedMarkup).toContain('data-slot="sidebar-mobile-trigger"');
    expect(closedMarkup).not.toContain('role="dialog"');
    expect(openMarkup).toContain('data-slot="sidebar-mobile"');
    expect(openMarkup).toContain('role="dialog"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const element = <SidebarExample collapsed />;
    const container = document.createElement("div");

    container.innerHTML = renderToString(element);

    await act(async () => {
      hydrateRoot(container, element);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
