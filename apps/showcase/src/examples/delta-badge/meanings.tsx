"use client";

import { DeltaBadge, type DeltaBadgeVariant } from "@dethink/components";

const variants: DeltaBadgeVariant[] = ["soft", "outline", "plain"];

const rows = [
  { metric: "Revenue", value: 12.4, positiveDirection: "up" as const },
  { metric: "Active users", value: -3.1, positiveDirection: "up" as const },
  { metric: "Churn", value: -0.8, positiveDirection: "down" as const },
  { metric: "p95 latency", value: 6.5, positiveDirection: "down" as const },
  { metric: "Error budget", value: 0.1, positiveDirection: "up" as const },
];

export function DeltaBadgeMeanings() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[28rem] text-sm">
        <thead>
          <tr className="text-muted-foreground text-start text-xs">
            <th scope="col" className="pb-3 text-start font-medium">
              Metric
            </th>
            {variants.map((variant) => (
              <th
                key={variant}
                scope="col"
                className="pb-3 text-start font-medium"
              >
                {variant}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.metric} className="border-border border-t">
              <th scope="row" className="py-3 text-start font-medium">
                {row.metric}
                {row.positiveDirection === "down" ? (
                  <span className="text-muted-foreground block text-xs font-normal">
                    Lower is better
                  </span>
                ) : null}
              </th>
              {variants.map((variant) => (
                <td key={variant} className="py-3">
                  <DeltaBadge
                    value={row.value}
                    positiveDirection={row.positiveDirection}
                    neutralThreshold={0.25}
                    comparison="vs last month"
                    variant={variant}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
