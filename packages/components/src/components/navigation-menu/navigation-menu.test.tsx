import { createRef, forwardRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuClassNames,
  navigationMenuItemClassNames,
  navigationMenuLinkClassNames,
  navigationMenuListClassNames,
  type NavigationMenuOrientation,
  type NavigationMenuSize,
  type NavigationMenuVariant,
} from ".";

const variants: NavigationMenuVariant[] = ["default", "quiet", "underline"];
const sizes: NavigationMenuSize[] = ["sm", "md", "lg"];
const orientations: NavigationMenuOrientation[] = ["horizontal", "vertical"];

const RouterLink = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} {...props}>
    {children}
  </a>
));
RouterLink.displayName = "RouterLink";

function renderSimpleNav(
  props: React.ComponentProps<typeof NavigationMenu> = {},
) {
  return render(
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="overview">
          <NavigationMenuLink current href="/overview">
            Overview
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="projects">
          <NavigationMenuLink href="/projects">Projects</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="billing">
          <NavigationMenuLink disabled href="/billing">
            Billing
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="status">
          <NavigationMenuLink external href="https://status.example.com">
            Status
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  );
}

describe("NavigationMenu", () => {
  it("renders a labelled navigation landmark with list semantics", () => {
    renderSimpleNav();

    const nav = screen.getByRole("navigation", { name: "Main" });

    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveAttribute("data-slot", "navigation-menu");
    expect(nav).toHaveAttribute("data-variant", "default");
    expect(nav).toHaveAttribute("data-size", "md");
    expect(nav).toHaveAttribute("data-orientation", "horizontal");
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-slot",
      "navigation-menu-list",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("prefers an explicit aria-label over the default landmark label", () => {
    renderSimpleNav({ "aria-label": "Product areas" });

    expect(
      screen.getByRole("navigation", { name: "Product areas" }),
    ).toBeInTheDocument();
  });

  it("does not force a default label when aria-labelledby is provided", () => {
    render(
      <>
        <span id="nav-heading">Workspace</span>
        <NavigationMenu aria-labelledby="nav-heading">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/overview">Overview</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </>,
    );

    const nav = screen.getByRole("navigation", { name: "Workspace" });

    expect(nav).not.toHaveAttribute("aria-label");
  });

  it("does not use ARIA menu roles for ordinary navigation", () => {
    renderSimpleNav();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.queryByRole("menubar")).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it.each(variants)("renders the %s variant attributes", (variant) => {
    renderSimpleNav({ variant });

    expect(screen.getByRole("navigation", { name: "Main" })).toHaveAttribute(
      "data-variant",
      variant,
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "data-variant",
      variant,
    );
  });

  it.each(sizes)("renders the %s size attributes", (size) => {
    renderSimpleNav({ size });

    expect(screen.getByRole("navigation", { name: "Main" })).toHaveAttribute(
      "data-size",
      size,
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "data-size",
      size,
    );
  });

  it.each(orientations)(
    "renders the %s orientation attributes",
    (orientation) => {
      renderSimpleNav({ orientation });

      expect(screen.getByRole("navigation", { name: "Main" })).toHaveAttribute(
        "data-orientation",
        orientation,
      );
      expect(screen.getByRole("list")).toHaveAttribute(
        "data-orientation",
        orientation,
      );
    },
  );

  it("exposes stable item values through data attributes", () => {
    renderSimpleNav();

    const [overview] = screen.getAllByRole("listitem");

    expect(overview).toHaveAttribute("data-slot", "navigation-menu-item");
    expect(overview).toHaveAttribute("data-value", "overview");
  });

  it("composes consumer classes on every part", () => {
    render(
      <NavigationMenu className="custom-nav">
        <NavigationMenuList className="custom-list">
          <NavigationMenuItem className="custom-item">
            <NavigationMenuLink className="custom-link" href="/overview">
              Overview
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(
      screen.getByRole("navigation", { name: "Main" }).className,
    ).toContain("custom-nav");
    expect(screen.getByRole("list").className).toContain("custom-list");
    expect(screen.getByRole("listitem").className).toContain("custom-item");
    expect(screen.getByRole("link", { name: "Overview" }).className).toContain(
      "custom-link",
    );
  });

  it("uses tokenized focus-visible and state selectors", () => {
    const className = navigationMenuLinkClassNames();

    expect(className).toContain("focus-visible:ring-ring");
    expect(className).toContain("focus-visible:ring-offset-background");
    expect(className).toContain("data-[current=true]:text-foreground");
    expect(className).toContain("data-[disabled=true]:opacity-50");
  });

  it("merges consumer classes after baseline classes in every helper", () => {
    expect(navigationMenuClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(navigationMenuListClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(navigationMenuItemClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(navigationMenuLinkClassNames({ className: "custom" })).toContain(
      "custom",
    );
  });
});

describe("NavigationMenuLink", () => {
  it("requires href in native mode at the TypeScript boundary", () => {
    const valid = <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>;
    // @ts-expect-error Native NavigationMenuLink mode requires href.
    const invalid = <NavigationMenuLink>Missing href</NavigationMenuLink>;

    expect(valid).toBeTruthy();
    expect(invalid).toBeTruthy();
  });

  it("marks current links with aria-current page by default", () => {
    renderSimpleNav();

    const current = screen.getByRole("link", { name: "Overview" });

    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("data-current", "true");
    expect(screen.getByRole("link", { name: "Projects" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("supports aria-current location through the current prop", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink current="location" href="/docs/getting-started">
              Getting started
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const link = screen.getByRole("link", { name: "Getting started" });

    expect(link).toHaveAttribute("aria-current", "location");
    expect(link).toHaveAttribute("data-current", "true");
  });

  it("lets an explicit aria-current override the current prop", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              aria-current="location"
              current
              href="/docs/getting-started"
            >
              Getting started
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(
      screen.getByRole("link", { name: "Getting started" }),
    ).toHaveAttribute("aria-current", "location");
  });

  it("removes href, exposes aria-disabled, and blocks activation when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink disabled href="/billing" onClick={onClick}>
              Billing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const link = screen.getByText("Billing");

    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("data-disabled", "true");

    await user.click(link);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("opens external links safely with a stable external attribute", () => {
    renderSimpleNav();

    const external = screen.getByRole("link", { name: "Status" });

    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", "noopener noreferrer");
    expect(external).toHaveAttribute("data-external", "true");
  });

  it("preserves existing rel tokens and explicit targets on external links", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              external
              href="https://example.com"
              rel="nofollow"
              target="_self"
            >
              Partner site
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const link = screen.getByRole("link", { name: "Partner site" });

    expect(link).toHaveAttribute("target", "_self");
    expect(link).toHaveAttribute("rel", "nofollow noopener noreferrer");
  });

  it("fires click handlers for enabled links", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/projects" onClick={onClick}>
              Projects
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    await user.click(screen.getByRole("link", { name: "Projects" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards refs to the native anchor", () => {
    const ref = createRef<HTMLAnchorElement>();

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink ref={ref} href="/overview">
              Overview
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(ref.current?.tagName).toBe("A");
  });

  it("composes classes, refs, events, and state onto a child element", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLAnchorElement>();
    const linkClick = vi.fn();
    const childClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <NavigationMenu size="lg" variant="quiet">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild current onClick={linkClick}>
              <RouterLink
                ref={ref}
                className="custom-link"
                onClick={childClick}
                to="/overview"
              >
                Router overview
              </RouterLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const link = screen.getByRole("link", { name: "Router overview" });

    expect(link).toHaveAttribute("href", "/overview");
    expect(link).toHaveAttribute("data-slot", "navigation-menu-link");
    expect(link).toHaveAttribute("data-variant", "quiet");
    expect(link).toHaveAttribute("data-size", "lg");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-current", "true");
    expect(link.className).toContain("custom-link");
    expect(ref.current?.tagName).toBe("A");

    await user.click(link);

    expect(linkClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("lets child props win in asChild composition", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild href="/from-link" target="_self">
              <a href="/from-child" target="_blank">
                Child wins
              </a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const link = screen.getByRole("link", { name: "Child wins" });

    expect(link).toHaveAttribute("href", "/from-child");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("removes the child href and blocks activation when disabled with asChild", async () => {
    const user = userEvent.setup();
    const childClick = vi.fn();

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild disabled>
              <a href="/billing" onClick={childClick}>
                Billing
              </a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const link = screen.getByText("Billing");

    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("data-disabled", "true");

    await user.click(link);

    expect(childClick).not.toHaveBeenCalled();
  });
});
