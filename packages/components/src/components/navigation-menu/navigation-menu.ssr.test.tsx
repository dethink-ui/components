import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuTrigger,
} from ".";

function SimpleNav() {
  return (
    <NavigationMenu aria-label="Product">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink current href="/overview">
            Overview
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink external href="https://status.example.com">
            Status
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function FlyoutNav({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <NavigationMenu aria-label="Product" defaultValue={defaultValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuSection>
              <NavigationMenuLink href="/analytics">
                Analytics
              </NavigationMenuLink>
            </NavigationMenuSection>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe("NavigationMenu SSR", () => {
  it("renders navigation markup on the server", () => {
    const markup = renderToString(<SimpleNav />);

    expect(markup).toContain('data-slot="navigation-menu"');
    expect(markup).toContain('data-slot="navigation-menu-list"');
    expect(markup).toContain('data-slot="navigation-menu-item"');
    expect(markup).toContain('data-slot="navigation-menu-link"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("<nav");
  });

  it("renders asChild composition on the server", () => {
    expect(
      renderToString(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <a href="/router">Router overview</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      ),
    ).toContain('href="/router"');
  });

  it("renders closed flyout triggers on the server", () => {
    const markup = renderToString(<FlyoutNav />);

    expect(markup).toContain('data-slot="navigation-menu-trigger"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain('data-slot="navigation-menu-content"');
  });

  it("renders default-open flyout content on the server", () => {
    const markup = renderToString(<FlyoutNav defaultValue="products" />);

    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('data-slot="navigation-menu-content"');
    expect(markup).toContain('data-slot="navigation-menu-section"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<SimpleNav />);

    await act(async () => {
      hydrateRoot(container, <SimpleNav />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates flyout navigation without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<FlyoutNav defaultValue="products" />);

    await act(async () => {
      hydrateRoot(container, <FlyoutNav defaultValue="products" />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
