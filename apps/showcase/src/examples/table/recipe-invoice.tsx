"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@dethink/components";

const lines = [
  { item: "Team plan · 12 seats", qty: 12, unit: 29, note: "" },
  { item: "SSO add-on", qty: 1, unit: 99, note: "" },
  { item: "Usage overage", qty: 41_000, unit: 0.0008, note: "per request", muted: true },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Semantic table anatomy carrying real invoice structure: numeric columns
 * right-aligned with tabular numerals, a muted tone for secondary lines,
 * and the total in a real TableFooter.
 */
export function TableRecipeInvoice() {
  const total = lines.reduce((sum, line) => sum + line.qty * line.unit, 0);

  return (
    <Table>
      <TableCaption placement="top">Invoice #2026-0714 — July 2026</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead align="end">Qty</TableHead>
          <TableHead align="end">Unit</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={line.item} tone={line.muted ? "muted" : "default"}>
            <TableCell>
              {line.item}
              {line.note ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  {line.note}
                </span>
              ) : null}
            </TableCell>
            <TableCell align="end" className="tabular-nums">
              {line.qty.toLocaleString("en-US")}
            </TableCell>
            <TableCell align="end" className="tabular-nums">
              {currency.format(line.unit)}
            </TableCell>
            <TableCell align="end" className="tabular-nums">
              {currency.format(line.qty * line.unit)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="font-medium">
            Total due
          </TableCell>
          <TableCell align="end" className="font-medium tabular-nums">
            {currency.format(total)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
