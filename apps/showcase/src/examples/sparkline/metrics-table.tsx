"use client";

import {
  Sparkline,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type ChartColor,
} from "@dethink/components";

const rows: Array<{
  metric: string;
  value: string;
  color: ChartColor;
  trend: Array<number | null>;
}> = [
  {
    metric: "Active workspaces",
    value: "12,408",
    color: "chart-1",
    trend: [9.1, 9.4, 9.8, 10.1, 10.6, 10.9, 11.2, 11.8, 12.1, 12.4],
  },
  {
    metric: "API p95 latency",
    value: "182 ms",
    color: "chart-2",
    trend: [240, 232, 251, 220, 205, 212, 198, 190, 188, 182],
  },
  {
    metric: "Weekly signups",
    value: "1,284",
    color: "chart-3",
    trend: [860, 910, null, 1020, 980, 1110, 1150, 1210, 1190, 1284],
  },
  {
    metric: "Open incidents",
    value: "3",
    color: "chart-7",
    trend: [6, 4, 7, 5, 3, 4, 2, 5, 4, 3],
  },
];

export function SparklineMetricsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metric</TableHead>
          <TableHead className="text-end">Current</TableHead>
          <TableHead className="w-40">Last 10 weeks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.metric}>
            <TableCell className="font-medium">{row.metric}</TableCell>
            <TableCell className="text-end tabular-nums">{row.value}</TableCell>
            <TableCell>
              <Sparkline
                data={row.trend}
                color={row.color}
                label={`${row.metric}, last 10 weeks`}
                className="h-7"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
