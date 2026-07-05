"use client";

import { useState } from "react";
import {
  Button,
  IconButton,
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
import {
  BarChart3,
  BookOpen,
  Bot,
  CreditCard,
  LifeBuoy,
  Menu,
  Moon,
  Newspaper,
  Rocket,
  Sparkles,
  Sun,
  Workflow,
  X,
} from "lucide-react";

const productLinks = [
  {
    href: "#analytics",
    label: "Analytics",
    description: "Usage dashboards for every workspace.",
    icon: BarChart3,
  },
  {
    href: "#automation",
    label: "Automation",
    description: "Build workflows that react to events.",
    icon: Workflow,
  },
  {
    href: "#assistant",
    label: "AI Assistant",
    description: "Ask questions across all your data.",
    icon: Bot,
  },
];

const resourceLinks = [
  {
    href: "#docs",
    label: "Documentation",
    description: "Guides, API reference, and recipes.",
    icon: BookOpen,
  },
  {
    href: "#blog",
    label: "Blog",
    description: "Product updates and engineering notes.",
    icon: Newspaper,
  },
  {
    href: "#support",
    label: "Support",
    description: "Talk to a human when you need one.",
    icon: LifeBuoy,
  },
];

function BrandLogo() {
  return (
    <a
      href="#home"
      className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm"
      >
        <Sparkles className="size-4" />
      </span>
      <span className="text-base font-semibold tracking-tight text-foreground">
        Dethink
      </span>
    </a>
  );
}

/**
 * The same destinations power both layouts. In the stacked (mobile) layout the
 * flyout panels are restyled into in-place accordions: the item stacks, the
 * trigger spans the row, and the content swaps its absolute side panel for a
 * static full-width block.
 */
function BrandNavItems({ stacked = false }: { stacked?: boolean }) {
  const itemClass = stacked ? "w-full flex-col items-stretch" : undefined;
  const triggerClass = stacked
    ? "w-full [&>[data-slot=navigation-menu-trigger-icon]]:ms-auto"
    : undefined;
  const contentClass = stacked
    ? "static w-full max-w-none flex-col border-0 bg-transparent p-0 ps-[var(--dt-space-2)] pt-[var(--dt-space-1)] shadow-none"
    : undefined;
  const linkClass = stacked ? "w-full" : undefined;

  return (
    <>
      <NavigationMenuItem className={itemClass} value="product">
        <NavigationMenuTrigger className={triggerClass}>
          <Rocket aria-hidden="true" className="size-4 text-muted-foreground" />
          Product
        </NavigationMenuTrigger>
        <NavigationMenuContent className={contentClass}>
          <NavigationMenuFeaturedItem
            href="#platform"
            className={stacked ? "w-full" : undefined}
          >
            Platform overview
            <NavigationMenuDescription>
              Analytics, automation, and AI in one workspace.
            </NavigationMenuDescription>
          </NavigationMenuFeaturedItem>
          {stacked ? null : <NavigationMenuSeparator orientation="vertical" />}
          <NavigationMenuSection className={stacked ? "w-full" : undefined}>
            <NavigationMenuLabel>Products</NavigationMenuLabel>
            {productLinks.map(({ href, label, description, icon: Icon }) => (
              <NavigationMenuLink
                key={href}
                href={href}
                icon={<Icon aria-hidden="true" />}
              >
                {label}
                <NavigationMenuDescription>
                  {description}
                </NavigationMenuDescription>
              </NavigationMenuLink>
            ))}
          </NavigationMenuSection>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem className={itemClass} value="resources">
        <NavigationMenuTrigger className={triggerClass}>
          <BookOpen
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          Resources
        </NavigationMenuTrigger>
        <NavigationMenuContent className={contentClass}>
          <NavigationMenuSection className={stacked ? "w-full" : undefined}>
            <NavigationMenuLabel>Learn</NavigationMenuLabel>
            {resourceLinks.map(({ href, label, description, icon: Icon }) => (
              <NavigationMenuLink
                key={href}
                href={href}
                icon={<Icon aria-hidden="true" />}
              >
                {label}
                <NavigationMenuDescription>
                  {description}
                </NavigationMenuDescription>
              </NavigationMenuLink>
            ))}
          </NavigationMenuSection>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem className={stacked ? "w-full" : undefined}>
        <NavigationMenuLink
          current
          href="#pricing"
          icon={<CreditCard aria-hidden="true" />}
          className={linkClass}
        >
          Pricing
        </NavigationMenuLink>
      </NavigationMenuItem>
    </>
  );
}

export function NavigationMenuBrandNavbar() {
  // Local to the example — a real app would drive this from its theme provider.
  const [darkPreview, setDarkPreview] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ThemeIcon = darkPreview ? Moon : Sun;

  return (
    // The container query keeps the collapse tied to the navbar's own width,
    // so the example adapts to whatever column hosts it.
    <div className="min-h-[26rem] @container">
      <header className="rounded-xl border border-border bg-background/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-2 px-3">
          <BrandLogo />

          {/* Wide: icon-led navigation with the animated indicator. The panel
              max-width is capped so flyouts stay inside the navbar column. */}
          <NavigationMenu
            aria-label="Main"
            className="@max-3xl:hidden [--dt-navigation-menu-content-max-width:34rem]"
          >
            <NavigationMenuList>
              <BrandNavItems />
              <NavigationMenuIndicator />
            </NavigationMenuList>
          </NavigationMenu>

          <div className="ml-auto flex items-center gap-1.5">
            <IconButton
              aria-label={
                darkPreview ? "Switch to light theme" : "Switch to dark theme"
              }
              aria-pressed={darkPreview}
              variant="ghost"
              size="sm"
              onClick={() => setDarkPreview((previous) => !previous)}
            >
              <ThemeIcon aria-hidden="true" />
            </IconButton>

            <span
              aria-hidden="true"
              className="mx-1 h-5 w-px bg-border @max-md:hidden"
            />

            <Button variant="ghost" size="sm" className="@max-md:hidden">
              Log in
            </Button>
            <Button size="sm">Get started</Button>

            {/* Narrow: the burger expands an integrated panel below the bar —
                no overlay, the navbar simply grows. */}
            <IconButton
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              aria-controls="brand-navbar-mobile-panel"
              variant="ghost"
              size="sm"
              className="@3xl:hidden"
              onClick={() => setMobileOpen((previous) => !previous)}
            >
              {mobileOpen ? (
                <X aria-hidden="true" />
              ) : (
                <Menu aria-hidden="true" />
              )}
            </IconButton>
          </div>
        </div>

        <div
          id="brand-navbar-mobile-panel"
          hidden={!mobileOpen}
          className="border-t border-border @3xl:hidden"
        >
          <div className="space-y-3 px-3 py-3">
            <NavigationMenu
              aria-label="Main"
              orientation="vertical"
              variant="quiet"
              className="w-full"
            >
              <NavigationMenuList className="w-full">
                <BrandNavItems stacked />
              </NavigationMenuList>
            </NavigationMenu>
            {/* Mirror the login action while the bar hides it. */}
            <div className="border-t border-border pt-3 @md:hidden">
              <Button variant="outline" size="sm" className="w-full">
                Log in
              </Button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
