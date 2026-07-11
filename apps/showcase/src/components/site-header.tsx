"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconButton,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@dethink/components";
import { Menu, X } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { ThemePicker } from "@/components/theme-picker";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/components", label: "Components" },
  { href: "/recipes", label: "Recipes" },
];

function BrandMark() {
  return (
    <span
      data-brand-logo="component-stack"
      aria-hidden="true"
      className="sc-brand-mark text-primary-foreground grid size-7 shrink-0 place-items-center rounded-lg shadow-sm"
    >
      <svg
        viewBox="0 0 28 28"
        fill="none"
        className="size-full"
        aria-hidden="true"
      >
        <rect x="5.5" y="6" width="10" height="7" rx="2" fill="currentColor" />
        <rect
          x="17.5"
          y="6"
          width="5"
          height="7"
          rx="2"
          fill="currentColor"
          fillOpacity="0.72"
        />
        <rect
          x="5.5"
          y="15"
          width="5"
          height="7"
          rx="2"
          fill="currentColor"
          fillOpacity="0.72"
        />
        <rect
          x="12.5"
          y="15"
          width="10"
          height="7"
          rx="2"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function GithubLink() {
  return (
    <a
      href="https://github.com/parveshh/dethink-components"
      target="_blank"
      rel="noreferrer"
      aria-label="Dethink Components on GitHub"
      className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-8 place-items-center rounded-md transition-colors"
    >
      <GithubIcon className="size-4" />
    </a>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile panel after a navigation; the sticky header persists
  // across route changes, so the panel would otherwise stay expanded.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading flex shrink-0 items-center gap-3 rounded-md text-[15px] font-semibold tracking-tight"
        >
          <BrandMark />
          Dethink<span className="text-primary">/</span>Components
        </Link>

        {/* Wide: inline link bar. */}
        <NavigationMenu
          aria-label="Main"
          size="md"
          className="flex-1 max-md:hidden"
        >
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild current={isCurrent(link.href)}>
                  <Link href={link.href}>{link.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-2 max-md:hidden">
          <GithubLink />
          <ThemePicker />
          <ThemeToggle />
        </div>

        {/* Narrow: the burger expands an integrated panel below the bar. */}
        <IconButton
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="site-header-mobile-panel"
          variant="ghost"
          size="sm"
          className="ml-auto md:hidden"
          onClick={() => setMobileOpen((previous) => !previous)}
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </IconButton>
      </div>

      <div
        id="site-header-mobile-panel"
        hidden={!mobileOpen}
        className="border-border/70 border-t md:hidden"
      >
        <div className="space-y-3 px-4 py-3">
          <NavigationMenu
            aria-label="Main"
            orientation="vertical"
            variant="quiet"
            className="w-full"
          >
            <NavigationMenuList className="w-full">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href} className="w-full">
                  <NavigationMenuLink
                    asChild
                    current={isCurrent(link.href)}
                    className="w-full"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <div className="border-border/70 flex items-center justify-between gap-2 border-t pt-3">
            <GithubLink />
            <div className="flex items-center gap-2">
              <ThemePicker />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
