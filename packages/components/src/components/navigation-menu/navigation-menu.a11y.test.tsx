import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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
});
