import type { ReactNode } from "react";
import { ComponentsNav } from "@/components/components-nav";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-12">
        <aside className="border-border/70 sticky top-14 hidden max-h-[calc(100svh-3.5rem)] border-r py-10 pr-4 lg:block">
          <div className="sc-components-nav-scroll max-h-[calc(100svh-8.5rem)] overflow-y-auto pr-1 pb-12">
            <ComponentsNav />
          </div>
        </aside>
        <div className="min-w-0 py-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
