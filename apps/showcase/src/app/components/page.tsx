import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { componentCatalog, componentGroups } from "@/lib/components-meta";

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
          Every component ships with live examples, copyable usage code, a
          complete props reference, and a production-shaped recipe. The{" "}
          {componentCatalog.length} documented registry components are grouped
          by type.
        </p>
      </header>
      <div className="space-y-12">
        {componentGroups.map((group) => (
          <section
            key={group.id}
            aria-labelledby={`${group.id}-heading`}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <h2
                id={`${group.id}-heading`}
                className="font-heading text-2xl font-semibold tracking-tight"
              >
                {group.name}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {group.description}
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.components.map((component) => (
                <li key={component.slug}>
                  <Link
                    href={`/components/${component.slug}`}
                    className="group flex h-full flex-col gap-2 rounded-md border border-border bg-background p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/[0.04]"
                  >
                    <span className="flex items-center justify-between gap-3 font-heading text-lg font-semibold">
                      {component.name}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </span>
                    <span className="text-sm leading-6 text-muted-foreground">
                      {component.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
