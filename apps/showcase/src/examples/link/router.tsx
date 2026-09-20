"use client";

import NextLink from "next/link";
import { Link } from "@dethink/components";
import { ExternalLink } from "lucide-react";

export function LinkRouter() {
  return (
    <div className="mx-auto max-w-md space-y-2 text-sm">
      <p>
        {/* asChild merges the styling onto the framework's router link. */}
        <Link asChild>
          <NextLink href="/components">Browse the catalog</NextLink>
        </Link>{" "}
        stays a real Next.js client-side navigation.
      </p>
      <p>
        <Link
          href="https://github.com/dethink-ui/components"
          target="_blank"
          rel="noreferrer"
        >
          View source on GitHub
          <ExternalLink
            aria-hidden="true"
            className="ml-1 inline size-3.5 align-[-0.125em]"
          />
          <span className="sr-only">(opens in a new tab)</span>
        </Link>
      </p>
    </div>
  );
}
