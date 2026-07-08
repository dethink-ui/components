"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuTrigger,
} from "@dethink/components";

export function NavigationMenuOverflow() {
  return (
    <div className="min-h-[16rem]">
      <NavigationMenu aria-label="Product">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink current href="#overview">
              Overview
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#projects">Projects</NavigationMenuLink>
          </NavigationMenuItem>
          {/* Secondary destinations stay reachable on narrow screens by
              collapsing behind a disclosure trigger instead of wrapping. */}
          <NavigationMenuItem className="lg:hidden" value="more">
            <NavigationMenuTrigger>More</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
                <NavigationMenuLink href="#audit">Audit log</NavigationMenuLink>
                <NavigationMenuLink href="#settings">
                  Settings
                </NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {/* On wide screens the same links render inline. */}
          <NavigationMenuItem className="max-lg:hidden">
            <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="max-lg:hidden">
            <NavigationMenuLink href="#audit">Audit log</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="max-lg:hidden">
            <NavigationMenuLink href="#settings">Settings</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
