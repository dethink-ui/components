"use client";

import { Pagination } from "@dethink/components";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LinkedPagination() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get("page") ?? 6);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, 18)
      : 6;

  return (
    <Pagination
      aria-label="URL result pages"
      hrefForPage={(nextPage) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(nextPage));
        return `${pathname}?${params}`;
      }}
      onClick={(event) => {
        // Keep copy-link, new-tab, and modified-click behavior native.
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const link =
          event.target instanceof Element
            ? event.target.closest("a[href]")
            : null;
        if (
          !(link instanceof HTMLAnchorElement) ||
          link.hasAttribute("download") ||
          (link.target && link.target !== "_self")
        )
          return;
        event.preventDefault();
        const url = new URL(link.href);
        url.hash = window.location.hash;
        if (url.href !== window.location.href) {
          // This demo owns local URL state; no server data needs refetching.
          // Next.js synchronizes useSearchParams with the native history API.
          window.history.pushState(null, "", url);
        }
      }}
      page={page}
      pageCount={18}
      showFirstLast
    />
  );
}

export function PaginationLinkMode() {
  return (
    <Suspense
      fallback={
        <Pagination
          aria-label="URL result pages"
          page={6}
          pageCount={18}
          showFirstLast
        />
      }
    >
      <LinkedPagination />
    </Suspense>
  );
}
