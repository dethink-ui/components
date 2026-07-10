import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarRail,
} from "../sidebar";
import {
  SidebarShell,
  SidebarShellFooter,
  SidebarShellHeader,
  SidebarShellMain,
} from ".";

expect.extend(toHaveNoViolations);

function AccessibleShell({
  defaultCollapsed = false,
  side = "left",
}: {
  defaultCollapsed?: boolean;
  side?: "left" | "right";
}) {
  return (
    <DethinkProvider theme="light">
      <SidebarShell defaultCollapsed={defaultCollapsed} side={side}>
        <Sidebar aria-label="Operations navigation">
          <SidebarHeader>Operations</SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink current href="/overview">
                  Overview
                </SidebarMenuLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuLink href="/incidents">Incidents</SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarShellHeader aria-label="Workspace toolbar">
          Command center
        </SidebarShellHeader>
        <SidebarShellMain>Operational overview</SidebarShellMain>
        <SidebarShellFooter>All systems operational</SidebarShellFooter>
      </SidebarShell>
    </DethinkProvider>
  );
}

describe("SidebarShell accessibility", () => {
  it.each([
    { defaultCollapsed: false, side: "left" as const },
    { defaultCollapsed: true, side: "left" as const },
    { defaultCollapsed: false, side: "right" as const },
  ])(
    "has no axe violations for $side collapsed=$defaultCollapsed",
    async ({ defaultCollapsed, side }) => {
      const { container } = render(
        <AccessibleShell defaultCollapsed={defaultCollapsed} side={side} />,
      );

      await expect(axe(container)).resolves.toHaveNoViolations();
    },
  );

  it("retains accessible semantics when motion is disabled", async () => {
    const { container } = render(
      <DethinkProvider theme="dark">
        <SidebarShell animate={false} chrome="plain">
          <Sidebar aria-label="Static navigation" />
          <SidebarShellMain>Static shell</SidebarShellMain>
        </SidebarShell>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
