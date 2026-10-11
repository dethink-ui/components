"use client";

import { BarChart } from "@dethink/components";

const data = [
  { quarter: "Q1 25", new: 84_000, expansion: 31_000, churn: -22_000 },
  { quarter: "Q2 25", new: 91_000, expansion: 36_000, churn: -18_000 },
  { quarter: "Q3 25", new: 78_000, expansion: 42_000, churn: -27_000 },
  { quarter: "Q4 25", new: 102_000, expansion: 47_000, churn: -21_000 },
  { quarter: "Q1 26", new: 110_000, expansion: 52_000, churn: -19_000 },
  { quarter: "Q2 26", new: 118_000, expansion: 58_000, churn: -24_000 },
  { quarter: "Q3 26", new: 125_000, expansion: 61_000, churn: -20_000 },
  { quarter: "Q4 26", new: 131_000, expansion: 66_000, churn: -23_000 },
];

export function BarChartNetRevenue() {
  return (
    <div className="w-full">
      <h3 id="net-revenue-heading" className="mb-3 text-sm font-medium">
        New MRR movement by quarter
      </h3>
      <BarChart
        aria-labelledby="net-revenue-heading"
        stacked
        data={data}
        index="quarter"
        indexLabel="Quarter"
        series={[
          { key: "new", label: "New" },
          { key: "expansion", label: "Expansion" },
          { key: "churn", label: "Churn" },
        ]}
        formatOptions={{ style: "currency", currency: "USD" }}
      />
    </div>
  );
}
