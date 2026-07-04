"use client";

import { useState } from "react";
import {
  Button,
  IconButton,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuTrigger,
} from "@dethink/components";
import {
  BarChart3,
  Bot,
  CreditCard,
  Home,
  LifeBuoy,
  Menu,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

/**
 * A self-contained mobile navigation drawer: a disclosure button toggles an
 * in-page panel (no overlay, so no Dialog needed), and the vertical
 * NavigationMenu turns its flyout into an accordion by restyling
 * NavigationMenuContent to flow in place.
 */
export function NavigationMenuMobileDrawer() {
  const [open, setOpen] = useState(true);

  return (
    <div className="mx-auto w-full max-w-[22rem] overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <a
          href="#home"
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground"
          >
            <Sparkles className="size-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Dethink
          </span>
        </a>
        <IconButton
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-drawer-panel"
          variant="ghost"
          size="sm"
          onClick={() => setOpen((previous) => !previous)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </IconButton>
      </div>

      <div id="mobile-drawer-panel" hidden={!open} className="border-t border-border">
        <div className="space-y-4 px-3 py-4">
          <NavigationMenu
            aria-label="Main"
            orientation="vertical"
            variant="quiet"
            className="w-full"
          >
            <NavigationMenuList className="w-full">
              <NavigationMenuItem className="w-full">
                <NavigationMenuLink
                  current
                  href="#home"
                  icon={<Home aria-hidden="true" />}
                  className="w-full"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* The flyout becomes an accordion: className swaps the
                  absolute side-panel for a static, full-width block. */}
              <NavigationMenuItem
                className="w-full flex-col items-stretch"
                value="products"
              >
                <NavigationMenuTrigger className="w-full justify-between">
                  Products
                </NavigationMenuTrigger>
                <NavigationMenuContent className="static w-full max-w-none border-0 bg-transparent p-0 ps-[var(--dt-space-2)] shadow-none">
                  <NavigationMenuSection className="w-full">
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
                    <NavigationMenuLink
                      href="#assistant"
                      icon={<Bot aria-hidden="true" />}
                    >
                      AI Assistant
                      <NavigationMenuDescription>
                        Ask questions across all your data.
                      </NavigationMenuDescription>
                    </NavigationMenuLink>
                  </NavigationMenuSection>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem className="w-full">
                <NavigationMenuLink
                  href="#pricing"
                  icon={<CreditCard aria-hidden="true" />}
                  className="w-full"
                >
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <NavigationMenuLink
                  external
                  href="https://status.example.com"
                  icon={<LifeBuoy aria-hidden="true" />}
                  className="w-full"
                >
                  Status
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="space-y-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" className="w-full">
              Log in
            </Button>
            <Button size="sm" className="w-full">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
