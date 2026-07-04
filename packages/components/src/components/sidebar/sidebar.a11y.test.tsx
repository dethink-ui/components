import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMobile,
  SidebarMobileTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarTrigger,
} from ".";

expect.extend(toHaveNoViolations);

describe("Sidebar accessibility", () => {
  it("has no axe violations for expanded and collapsed navigation", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <SidebarProvider defaultCollapsed>
          <Sidebar aria-label="Product navigation">
            <SidebarHeader>
              <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuLink current href="/overview">
                        Overview
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuLink href="/activity">Activity</SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuLink disabled href="/billing">
                        Billing
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </DethinkProvider>,
    );

    const sidebar = screen.getByRole("navigation", {
      name: "Product navigation",
    });

    expect(sidebar).toHaveAttribute("data-collapsed", "true");
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Billing" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for an open mobile drawer", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <SidebarProvider defaultMobileOpen>
          <SidebarMobileTrigger />
          <SidebarMobile label="Mobile product navigation">
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuLink current href="/mobile/overview">
                    Overview
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink href="/mobile/activity">Activity</SidebarMenuLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </SidebarMobile>
        </SidebarProvider>
      </DethinkProvider>,
    );

    expect(screen.getByRole("dialog", { name: "Mobile product navigation" })).toBeVisible();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
