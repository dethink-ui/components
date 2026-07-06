"use client";

import { useState } from "react";
import { Pagination } from "@dethink/components";

export function PaginationResponsiveCard() {
  const [page, setPage] = useState(5);

  return (
    <div className="mx-auto max-w-xs rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">Saved searches</h4>
        <p className="text-sm leading-6 text-muted-foreground">
          Small hosts collapse to Back/Next while RTL keeps the page summary at inline-start.
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
