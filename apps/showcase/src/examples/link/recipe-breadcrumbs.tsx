"use client";

import { Link } from "@dethink/components";
import { ChevronRight } from "lucide-react";

const trail = [
  { label: "Workspaces", href: "#recipes" },
  { label: "Acme Corp", href: "#recipes" },
  { label: "Projects", href: "#recipes" },
];

/**
 * Breadcrumbs are just nav variant links in an ordered list — the current
 * page is plain text with aria-current, not a link to itself.
 */
export function LinkRecipeBreadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="flex justify-center">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {trail.map((crumb) => (
          <li key={crumb.label} className="flex items-center gap-1.5">
            <Link href={crumb.href} variant="nav" underline="hover">
              {crumb.label}
            </Link>
            <ChevronRight
              aria-hidden="true"
              className="text-muted-foreground/60 size-3.5"
            />
          </li>
        ))}
        <li aria-current="page" className="font-medium">
          apollo
        </li>
      </ol>
    </nav>
  );
}
