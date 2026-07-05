"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuSeparator,
  NavigationMenuTrigger,
} from "@dethink/components";

export function NavigationMenuDocsHub() {
  return (
    <div className="min-h-[20rem]">
      <NavigationMenu aria-label="Documentation" variant="underline">
        <NavigationMenuList>
          <NavigationMenuItem value="guides">
            <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLabel>Getting started</NavigationMenuLabel>
                <NavigationMenuLink current="location" href="#install">
                  Installation
                  <NavigationMenuDescription>
                    Registry setup and base tokens.
                  </NavigationMenuDescription>
                </NavigationMenuLink>
                <NavigationMenuLink href="#theming">
                  Theming
                  <NavigationMenuDescription>
                    Light, dark, density, and brand palettes.
                  </NavigationMenuDescription>
                </NavigationMenuLink>
              </NavigationMenuSection>
              <NavigationMenuSeparator orientation="vertical" />
              <NavigationMenuSection>
                <NavigationMenuLabel>Recipes</NavigationMenuLabel>
                <NavigationMenuLink href="#forms">Forms</NavigationMenuLink>
                <NavigationMenuLink href="#tables">Tables</NavigationMenuLink>
                <NavigationMenuLink href="#navigation">
                  Navigation
                </NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="reference">
            <NavigationMenuTrigger>Reference</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLink href="#api">Component API</NavigationMenuLink>
                <NavigationMenuLink href="#tokens">Tokens</NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#changelog">Changelog</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
