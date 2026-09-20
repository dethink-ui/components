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
          Documentation
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Components
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
          Find the right component, try an example, and copy the code. Browse{" "}
          {componentCatalog.length} components grouped by what they do.
        </p>
      </header>
      <ComponentCatalog />
    </div>
  );
}
