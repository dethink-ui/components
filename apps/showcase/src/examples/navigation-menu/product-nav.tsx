"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuFeaturedItem,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuSeparator,
  NavigationMenuTrigger,
} from "@dethink/components";
import { BarChart3, Workflow } from "lucide-react";

export function NavigationMenuProductNav() {
  return (
    <div className="min-h-[22rem]">
      <NavigationMenu aria-label="Product">
        <NavigationMenuList>
          <NavigationMenuItem value="platform">
            <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuFeaturedItem href="#platform">
                Platform overview
                <NavigationMenuDescription>
                  Analytics, automation, and reporting in one workspace.
                </NavigationMenuDescription>
              </NavigationMenuFeaturedItem>
              <NavigationMenuSeparator orientation="vertical" />
              <NavigationMenuSection>
                <NavigationMenuLabel>Products</NavigationMenuLabel>
                <NavigationMenuLink
                  href="#analytics"
                  icon={<BarChart3 aria-hidden="true" />}
                >
                  Analytics
                  <NavigationMenuDescription>
                    Usage dashboards for every workspace.
                  </NavigationMenuDescription>
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="#automation"
                  icon={<Workflow aria-hidden="true" />}
                >
                  Automation
                  <NavigationMenuDescription>
                    Build workflows that react to events.
                  </NavigationMenuDescription>
                </NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="solutions">
            <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLabel>By team</NavigationMenuLabel>
                <NavigationMenuLink href="#product-teams">
                  Product teams
                </NavigationMenuLink>
                <NavigationMenuLink href="#data-teams">
                  Data teams
                </NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink current href="#pricing">
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
