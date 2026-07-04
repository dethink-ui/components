"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@dethink/components";

const releases = [
  { version: "1.4.0", date: "Jun 2026", downloads: "12,410" },
  { version: "1.3.2", date: "May 2026", downloads: "31,876" },
  { version: "1.3.1", date: "May 2026", downloads: "8,204" },
];

export function TableBasic() {
  return (
    <Table>
      <TableCaption>Recent releases and adoption.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Version</TableHead>
          <TableHead>Released</TableHead>
          <TableHead align="end">Downloads</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {releases.map((release) => (
          <TableRow key={release.version}>
            <TableCell className="font-mono">{release.version}</TableCell>
            <TableCell>{release.date}</TableCell>
            <TableCell align="end" className="tabular-nums">
              {release.downloads}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
