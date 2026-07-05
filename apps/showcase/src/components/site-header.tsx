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

const navLinks = [{ href: "/components", label: "Components" }];

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="sc-brand-mark grid size-7 shrink-0 place-items-center rounded-lg font-heading text-sm font-bold text-primary-foreground shadow-sm"
    >
      D
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
      className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 rounded-md font-heading text-[15px] font-semibold tracking-tight"
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
        className="border-t border-border/70 md:hidden"
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
          <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-3">
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
