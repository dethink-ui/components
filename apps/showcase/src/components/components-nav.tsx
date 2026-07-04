"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { componentCatalog } from "@/lib/components-meta";

export function ComponentsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Components" className="space-y-6">
      <div>
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Components
        </p>
        <ul className="space-y-0.5">
          {componentCatalog.map((component) => {
            const href = `/components/${component.slug}`;
            const active = pathname === href;
            return (
              <li key={component.slug}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {component.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
