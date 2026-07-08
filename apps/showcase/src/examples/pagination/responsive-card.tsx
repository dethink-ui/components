"use client";

import { useState } from "react";
import { Pagination } from "@dethink/components";

export function PaginationResponsiveCard() {
  const [page, setPage] = useState(5);

  return (
    <div className="border-border bg-background mx-auto max-w-xs rounded-lg border p-4 shadow-sm">
      <div className="space-y-1">
        <h4 className="text-foreground text-sm font-semibold">
          Saved searches
        </h4>
        <p className="text-muted-foreground text-sm leading-6">
          Small hosts collapse to Back/Next while RTL keeps the page summary at
          inline-start.
        </p>
      </div>
      <div className="mt-4" dir="rtl">
        <Pagination
          page={page}
          pageCount={12}
          showFirstLast
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
