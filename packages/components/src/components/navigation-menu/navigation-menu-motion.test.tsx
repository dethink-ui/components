import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuContentClassNames,
  navigationMenuIndicatorClassNames,
  navigationMenuViewportBodyClassNames,
  type NavigationMenuMotionPreset,
  type NavigationMenuProps,
} from ".";

const presets: NavigationMenuMotionPreset[] = [
  "none",
  "subtle",
  "standard",
  "expressive",
];

function MotionNav(props: Partial<NavigationMenuProps>) {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/analytics">Analytics</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/docs">Documentation</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="company">
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe("NavigationMenu motion presets", () => {
  it.each(presets)("exposes the %s preset as a data attribute", (preset) => {
    render(<MotionNav defaultValue="products" motion={preset} />);

    expect(screen.getByRole("navigation", { name: "Main" })).toHaveAttribute(
      "data-motion-preset",
      preset,
    );
    expect(
      document.querySelector('[data-slot="navigation-menu-content"]'),
    ).toHaveAttribute("data-motion-preset", preset);
  });

  it("defaults to the standard preset", () => {
    render(<MotionNav />);

    expect(screen.getByRole("navigation", { name: "Main" })).toHaveAttribute(
      "data-motion-preset",
      "standard",
    );
  });

  it("omits animation classes for the none preset", () => {
    const noneClasses = navigationMenuContentClassNames({
      motionPreset: "none",
    });
    const standardClasses = navigationMenuContentClassNames({
      motionPreset: "standard",
    });

    expect(noneClasses).not.toContain("animate-nav-slide-in");
    expect(standardClasses).toContain("animate-nav-slide-in");
    expect(standardClasses).toContain("animate-nav-slide-out");
  });

  it("keeps the subtle preset as a pure fade", () => {
    const subtleClasses = navigationMenuContentClassNames({
      motionPreset: "subtle",
    });

    expect(subtleClasses).toContain("[--dt-nav-motion-from-x:0px]");
    expect(subtleClasses).not.toContain("data-[motion=from-start]");
  });

  it("gates every animation behind motion-safe with reduced-motion fallbacks", () => {
    const contentClasses = navigationMenuContentClassNames({
      motionPreset: "standard",
    });
    const indicatorClasses = navigationMenuIndicatorClassNames();
    const viewportBodyClasses = navigationMenuViewportBodyClassNames();

    expect(contentClasses).toContain(
      "motion-safe:data-[state=open]:animate-nav-slide-in",
    );
    expect(contentClasses).toContain("motion-reduce:animate-none");
    expect(indicatorClasses).toContain("motion-reduce:transition-none");
    expect(viewportBodyClasses).toContain("transition-[width,height]");
    expect(viewportBodyClasses).toContain("motion-reduce:transition-none");
  });
});

describe("NavigationMenu directional transitions", () => {
  it("marks entering panels with a motion direction based on item order", async () => {
    const user = userEvent.setup();

    render(<MotionNav />);

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(
      document.querySelector('[data-slot="navigation-menu-content"]'),
    ).not.toHaveAttribute("data-motion");

    await user.click(screen.getByRole("button", { name: "Company" }));

    expect(
      document.querySelector(
        '[data-slot="navigation-menu-content"][data-state="open"]',
      ),
    ).toHaveAttribute("data-motion", "from-end");

    await user.click(screen.getByRole("button", { name: "Resources" }));

    expect(
      document.querySelector(
        '[data-slot="navigation-menu-content"][data-state="open"]',
      ),
    ).toHaveAttribute("data-motion", "from-start");
  });

  it("clears the motion direction when opening from a closed state", async () => {
    const user = userEvent.setup();

    render(<MotionNav />);

    await user.click(screen.getByRole("button", { name: "Resources" }));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(
      document.querySelector(
        '[data-slot="navigation-menu-content"][data-state="open"]',
      ),
    ).not.toHaveAttribute("data-motion");
  });
});

describe("NavigationMenuIndicator", () => {
  it("tracks the current link and hides without a target", () => {
    const { rerender } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink current href="/overview">
              Overview
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const indicator = document.querySelector(
      '[data-slot="navigation-menu-indicator"]',
    );

    expect(indicator?.tagName).toBe("LI");
    expect(indicator).toHaveAttribute("aria-hidden", "true");
    expect(indicator).toHaveAttribute("data-state", "visible");

    rerender(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/overview">Overview</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(
      document.querySelector('[data-slot="navigation-menu-indicator"]'),
    ).toHaveAttribute("data-state", "hidden");
  });

  it("moves to an open trigger and stays visually decorative", async () => {
    const user = userEvent.setup();

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/analytics">
                Analytics
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const indicator = document.querySelector(
      '[data-slot="navigation-menu-indicator"]',
    );

    expect(indicator).toHaveAttribute("data-state", "hidden");

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(indicator).toHaveAttribute("data-state", "visible");
    expect(screen.queryByRole("listitem", { hidden: false })).not.toBeNull();
  });
});

describe("NavigationMenuViewport morphing", () => {
  it("renders a sized viewport body that hosts the open panel", async () => {
    const user = userEvent.setup();

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/analytics">
                Analytics
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>,
    );

    const body = document.querySelector(
      '[data-slot="navigation-menu-viewport-body"]',
    );

    expect(body).toHaveAttribute("data-state", "closed");

    await user.click(screen.getByRole("button", { name: "Products" }));

    expect(body).toHaveAttribute("data-state", "open");
    expect(
      body?.querySelector('[data-slot="navigation-menu-content"]'),
    ).not.toBeNull();
  });

  it("keeps viewport-hosted panels stacked in a single grid cell", () => {
    expect(navigationMenuContentClassNames({ inline: false })).toContain(
      "col-start-1",
    );
    expect(navigationMenuViewportBodyClassNames()).toContain("grid");
  });
});
