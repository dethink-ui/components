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
        <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
          Catalog
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Components
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
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
              <p className="text-muted-foreground max-w-2xl text-sm leading-6">
                {group.description}
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.components.map((component) => (
                <li key={component.slug}>
                  <Link
                    href={`/components/${component.slug}`}
                    className="group border-border bg-background hover:border-primary/50 hover:bg-primary/[0.04] flex h-full flex-col gap-2 rounded-md border p-5 shadow-sm transition-colors"
                  >
                    <span className="font-heading flex items-center justify-between gap-3 text-lg font-semibold">
                      {component.name}
                      <ArrowRight
                        aria-hidden="true"
                        className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="text-muted-foreground text-sm leading-6">
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
