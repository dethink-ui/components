import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../dialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuTrigger,
  navigationMenuClassNames,
  navigationMenuItemClassNames,
  navigationMenuLinkClassNames,
  navigationMenuListClassNames,
} from ".";

function VerticalNav() {
  return (
    <NavigationMenu
      aria-label="Workspace sections"
      orientation="vertical"
      size="sm"
      variant="quiet"
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink current href="/overview">
            Overview
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/projects">Projects</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/settings">Settings</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe("NavigationMenu responsive composition", () => {
  it("keeps current state and semantics in compact vertical layouts", () => {
    render(<VerticalNav />);

    const nav = screen.getByRole("navigation", { name: "Workspace sections" });

    expect(nav).toHaveAttribute("data-orientation", "vertical");
    expect(nav).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("hands off to Dialog for mobile navigation without losing semantics", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger variant="outline">Open navigation</DialogTrigger>
        <DialogContent>
          <DialogTitle>Navigation</DialogTitle>
          <VerticalNav />
        </DialogContent>
      </Dialog>,
    );

    expect(
      screen.queryByRole("navigation", { name: "Workspace sections" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open navigation" }));

    const dialog = await screen.findByRole("dialog");
    const nav = screen.getByRole("navigation", { name: "Workspace sections" });

    expect(dialog.contains(nav)).toBe(true);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports an overflow trigger recipe for top navigation with many items", async () => {
    const user = userEvent.setup();

    render(
      <NavigationMenu aria-label="Product">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink current href="/overview">
              Overview
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/projects">Projects</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem value="more">
            <NavigationMenuTrigger>More</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLink href="/reports">Reports</NavigationMenuLink>
                <NavigationMenuLink current="location" href="/audit">
                  Audit log
                </NavigationMenuLink>
                <NavigationMenuLink href="/settings">Settings</NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const moreTrigger = screen.getByRole("button", { name: "More" });

    await user.click(moreTrigger);

    const overflowLink = screen.getByRole("link", { name: "Audit log" });

    expect(overflowLink).toHaveAttribute("aria-current", "location");
    expect(overflowLink).toHaveAttribute("data-panel", "true");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("link", { name: "Audit log" })).not.toBeInTheDocument();
    expect(moreTrigger).toHaveFocus();
  });

  it("composes responsive visibility utilities on every part", () => {
    expect(navigationMenuClassNames({ className: "max-md:hidden" })).toContain(
      "max-md:hidden",
    );
    expect(
      navigationMenuListClassNames({ className: "md:gap-[var(--dt-space-2)]" }),
    ).toContain("md:gap-[var(--dt-space-2)]");
    expect(navigationMenuItemClassNames({ className: "md:hidden" })).toContain(
      "md:hidden",
    );
    expect(
      navigationMenuLinkClassNames({ className: "max-lg:px-[var(--dt-space-2)]" }),
    ).toContain("max-lg:px-[var(--dt-space-2)]");
  });

  it("renders compact navigation inside a constrained container without menu roles", () => {
    render(
      <div style={{ width: 320 }}>
        <NavigationMenu aria-label="Compact" size="sm" className="max-w-full">
          <NavigationMenuList className="flex-wrap">
            <NavigationMenuItem>
              <NavigationMenuLink current href="/overview">
                Overview
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/projects">Projects</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>,
    );

    expect(screen.getByRole("navigation", { name: "Compact" })).toHaveAttribute(
      "data-size",
      "sm",
    );
    expect(screen.queryByRole("menubar")).not.toBeInTheDocument();
  });
});
