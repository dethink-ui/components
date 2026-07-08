"use client";

import { useState } from "react";
import { Pagination, Text } from "@dethink/components";

const rows = [
  ["INV-1048", "Acme EU", "$12,420", "Paid"],
  ["INV-1049", "Northstar", "$8,115", "Pending"],
  ["INV-1050", "Rivet Labs", "$4,680", "Paid"],
];

export function PaginationTableFooter() {
  const [page, setPage] = useState(3);

  return (
    <div className="border-border bg-background overflow-hidden rounded-lg border">
      <div className="border-border bg-muted/30 text-muted-foreground grid grid-cols-[1fr_auto_auto] gap-x-4 border-b px-4 py-2 text-xs font-medium tracking-wide uppercase">
        <span>Invoice</span>
        <span>Amount</span>
        <span>Status</span>
      </div>
      <div className="divide-border divide-y text-sm">
        {rows.map(([invoice, account, amount, status]) => (
          <div
            key={invoice}
            className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-3"
          >
            <span>
              <span className="text-foreground font-medium">{invoice}</span>
              <span className="text-muted-foreground block">{account}</span>
            </span>
            <span className="text-foreground tabular-nums">{amount}</span>
            <span className="text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
        <Text size="sm" tone="muted">
          Rows {(page - 1) * 10 + 1}-{page * 10} of 120
        </Text>
        <Pagination
          aria-label="Invoice pages"
          compact
          page={page}
          pageCount={12}
          status={false}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
