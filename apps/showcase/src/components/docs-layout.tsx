import type { ReactNode } from "react";
import Link from "next/link";
import { ComponentsNav } from "@/components/components-nav";

export function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
      <nav
        aria-label="Getting started"
        className="border-border flex flex-wrap gap-x-5 gap-y-2 border-b py-4 text-sm lg:hidden"
      >
        <Link href="/docs">Introduction</Link>
        <Link href="/docs/installation">Installation</Link>
        <Link href="/docs/theming">Theming</Link>
        <Link href="/components">Components</Link>
      </nav>
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10 xl:gap-12">
        <aside
          aria-label="Documentation navigation"
          className="border-border/70 sticky top-[var(--site-header-height)] hidden max-h-[calc(100svh-var(--site-header-height))] self-start border-r py-10 pr-4 lg:block"
        >
          <div className="sc-components-nav-scroll max-h-[calc(100svh-8.5rem)] overflow-y-auto pr-1 pb-12">
            <ComponentsNav />
          </div>
        </aside>
        <div className="min-w-0 py-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
