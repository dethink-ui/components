import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../dialog";
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
  type NavigationMenuVariant,
} from ".";

expect.extend(toHaveNoViolations);

const variants: NavigationMenuVariant[] = ["default", "quiet", "underline"];

describe("NavigationMenu accessibility", () => {
  it("has no axe violations for simple link navigation states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <header>
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
              <NavigationMenuItem>
                <NavigationMenuLink disabled href="/billing">
                  Billing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink external href="https://status.example.com">
                  Status
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </header>
        <main aria-label="NavigationMenu accessibility smoke">
          <p>Workspace content</p>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations across variants and orientations", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        {variants.map((variant) => (
          <NavigationMenu
            key={variant}
            aria-label={`${variant} navigation`}
            variant={variant}
          >
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink current="location" href="/docs/components">
                  Components
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/docs/tokens">Tokens</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        ))}
        <NavigationMenu aria-label="Sections" orientation="vertical">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink current href="/settings/general">
                General
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/settings/members">
                Members
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <main aria-label="NavigationMenu variant smoke">
          <p>Workspace content</p>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for an open rich flyout panel", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <header>
          <NavigationMenu aria-label="Product" defaultValue="products">
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
                    <NavigationMenuLink current href="/automation">
                      Automation
                    </NavigationMenuLink>
                    <NavigationMenuLink disabled href="/billing">
                      Billing
                    </NavigationMenuLink>
                    <NavigationMenuLink
                      external
                      href="https://status.example.com"
                    >
                      Status
                    </NavigationMenuLink>
                  </NavigationMenuSection>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value="resources">
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="/docs">
                    Documentation
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </header>
        <main aria-label="NavigationMenu flyout smoke">
          <p>Workspace content</p>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for mobile-composed navigation in a dialog", async () => {
    const user = userEvent.setup();

    render(
      <DethinkProvider theme="light">
        <header>
          <Dialog>
            <DialogTrigger variant="outline">Open navigation</DialogTrigger>
            <DialogContent>
              <DialogTitle>Navigate</DialogTitle>
              <NavigationMenu
                aria-label="Workspace sections"
                orientation="vertical"
                variant="quiet"
              >
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink current href="/overview">
                      Overview
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="/projects">
                      Projects
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </DialogContent>
          </Dialog>
        </header>
        <main aria-label="NavigationMenu mobile smoke">
          <p>Workspace content</p>
        </main>
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    await screen.findByRole("dialog");

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for viewport-hosted panels", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <header>
          <NavigationMenu aria-label="Product" defaultValue="products">
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
            </NavigationMenuList>
            <NavigationMenuViewport />
          </NavigationMenu>
        </header>
        <main aria-label="NavigationMenu viewport smoke">
          <p>Workspace content</p>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
