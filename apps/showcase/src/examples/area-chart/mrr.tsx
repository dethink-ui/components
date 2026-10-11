"use client";

import { AreaChart } from "@dethink/components";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const starter = [
  8_200, 8_600, 9_100, 9_300, 9_900, 10_400, 10_200, 10_900, 11_600, 11_800,
  12_300, 12_900,
];
const growth = [
  21_400, 22_100, 23_800, 24_600, 25_200, 27_100, 28_400, 29_000, 31_200,
  32_600, 33_100, 35_400,
];
const enterprise = [
  18_000, 18_000, 22_500, 22_500, 22_500, 26_000, 26_000, 30_500, 30_500,
  30_500, 36_000, 36_000,
];

const data = months.map((month, i) => ({
  month,
  starter: starter[i],
  growth: growth[i],
  enterprise: enterprise[i],
}));

export function AreaChartMrr() {
  return (
    <div className="w-full">
      <h3 id="mrr-heading" className="mb-3 text-sm font-medium">
        MRR by plan, 2026
      </h3>
      <AreaChart
        aria-labelledby="mrr-heading"
        stacked
        data={data}
        index="month"
        indexLabel="Month"
        series={[
          { key: "starter", label: "Starter" },
          { key: "growth", label: "Growth" },
          { key: "enterprise", label: "Enterprise" },
        ]}
        formatOptions={{ style: "currency", currency: "USD" }}
      />
    </div>
  );
}
