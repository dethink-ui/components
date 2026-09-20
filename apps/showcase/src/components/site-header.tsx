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
  RevealButton,
} from "@dethink/components";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { GithubIcon } from "@/components/icons";
import { ThemePicker } from "@/components/theme-picker";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/components", label: "Components" },
  { href: "/recipes", label: "Recipes" },
];

function GithubLink() {
  return (
    <RevealButton
      icon={<GithubIcon />}
      label="GitHub"
      size="sm"
      variant="ghost"
      className="text-muted-foreground hover:text-foreground"
      onClick={() => {
        window.open(
          "https://github.com/parveshh/dethink-components",
          "_blank",
          "noopener,noreferrer",
        );
      }}
    />
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
        <Link href="/" className="shrink-0 rounded-md">
          <BrandLogo />
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
