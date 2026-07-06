"use client";

import { Pagination } from "@dethink/components";

export function PaginationLinkMode() {
  return (
    <Pagination
      hrefForPage={(page) => `/components/pagination?page=${page}`}
      page={6}
      pageCount={18}
      showFirstLast
    />
  );
}
