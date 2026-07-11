import type { Metadata } from "next";
import { ComponentCatalog } from "@/components/component-catalog";
import { componentCatalog } from "@/lib/components-meta";

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
      <ComponentCatalog />
    </div>
  );
}
