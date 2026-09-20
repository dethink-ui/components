"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { GithubIcon } from "@/components/icons";
import { ThemePicker } from "@/components/theme-picker";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/components", label: "Components" },
  { href: "/recipes", label: "Recipes" },
];

const focusStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

function GithubLink() {
  return (
    <a
      href="https://github.com/dethink-ui/components"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub repository (opens in a new tab)"
      className={`text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-md ${focusStyles}`}
    >
      <GithubIcon className="size-4" />
    </a>
  );
}

function ParentSiteLink() {
  return (
    <a
      href="https://dethink.co.uk"
      className={`bg-foreground text-background hover:bg-foreground/90 inline-flex min-h-10 items-center justify-center gap-4 rounded-md px-4 text-xs font-semibold ${focusStyles}`}
    >
      Dethink studio <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  return <SiteHeaderContent key={pathname} pathname={pathname} />;
}

function SiteHeaderContent({ pathname }: { pathname: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-border/70 bg-background/95 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-[calc(var(--site-header-height)-1px)] w-full max-w-7xl items-center gap-8 px-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={`mr-auto shrink-0 rounded-md ${focusStyles}`}
          onClick={() => setMobileOpen(false)}
        >
          <BrandLogo />
        </Link>

        <nav aria-label="Main" className="max-lg:hidden">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  className={`text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground inline-flex min-h-11 items-center rounded-sm text-xs font-medium ${focusStyles}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4 max-lg:hidden">
          <div className="border-border flex items-center gap-2 border-l pl-4">
            <GithubLink />
            <ThemePicker />
            <ThemeToggle />
          </div>
          <ParentSiteLink />
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="site-header-mobile-panel"
          className={`hover:bg-muted grid size-11 shrink-0 place-items-center rounded-md lg:hidden ${focusStyles}`}
          onClick={() => setMobileOpen((previous) => !previous)}
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div
        id="site-header-mobile-panel"
        hidden={!mobileOpen}
        className="border-border/70 max-h-[calc(100svh-var(--site-header-height))] overflow-y-auto border-t lg:hidden"
      >
        <div className="space-y-4 px-5 pt-2 pb-5 sm:px-6">
          <nav aria-label="Main">
            <ul className="divide-border/60 divide-y">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground flex min-h-12 items-center justify-between gap-4 rounded-sm text-sm ${focusStyles}`}
                  >
                    {link.label}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <GithubLink />
            <div className="flex items-center gap-2">
              <ThemePicker />
              <ThemeToggle />
            </div>
          </div>
          <ParentSiteLink />
        </div>
      </div>
    </header>
  );
}
