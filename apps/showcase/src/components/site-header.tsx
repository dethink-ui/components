import Link from "next/link";
import { GithubIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,oklch(0.62_0.12_175),oklch(0.5_0.11_215))] font-heading text-sm font-bold text-white shadow-sm"
    >
      D
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md font-heading text-[15px] font-semibold tracking-tight"
        >
          <BrandMark />
          Dethink<span className="text-primary">/</span>Components
        </Link>
        <nav aria-label="Main" className="flex flex-1 items-center gap-1 text-sm">
          <Link
            href="/components"
            className="rounded-md px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Components
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/parveshh/dethink-components"
            target="_blank"
            rel="noreferrer"
            aria-label="Dethink Components on GitHub"
            className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <GithubIcon className="size-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
