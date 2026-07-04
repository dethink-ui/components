import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { componentCatalog, upcomingComponents } from "@/lib/components-meta";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Browse the Dethink Components catalog: live examples, usage code, and full props references.",
};

export default function ComponentsIndexPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Catalog
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Components</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Every component ships with live examples, copyable usage code, and a
          complete props reference. Sixteen are documented so far — the rest of
          the library is on its way.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {componentCatalog.map((component) => (
          <li key={component.slug}>
            <Link
              href={`/components/${component.slug}`}
              className="group flex h-full flex-col gap-2 rounded-lg border border-border bg-background p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/[0.04]"
            >
              <span className="flex items-center justify-between font-heading text-lg font-semibold">
                {component.name}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </span>
              <span className="text-sm leading-6 text-muted-foreground">
                {component.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <section aria-labelledby="upcoming-heading" className="space-y-3">
        <h2
          id="upcoming-heading"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Coming soon
        </h2>
        <ul className="flex flex-wrap gap-2">
          {upcomingComponents.map((name) => (
            <li
              key={name}
              className="rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground"
            >
              {name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
