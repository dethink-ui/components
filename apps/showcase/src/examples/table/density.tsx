"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@dethink/components";

const rows = [
  { region: "US East", p50: "38 ms", p99: "212 ms" },
  { region: "EU West", p50: "44 ms", p99: "301 ms" },
];

export function TableDensity() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {(["compact", "comfortable"] as const).map((density) => (
        <Table key={density} density={density}>
          <TableHeader>
            <TableRow>
              <TableHead>{density}</TableHead>
              <TableHead align="end">p50</TableHead>
              <TableHead align="end">p99</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.region}>
                <TableCell>{row.region}</TableCell>
                <TableCell align="end" className="tabular-nums">
                  {row.p50}
                </TableCell>
                <TableCell align="end" className="tabular-nums">
                  {row.p99}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ))}
    </div>
  );
}
