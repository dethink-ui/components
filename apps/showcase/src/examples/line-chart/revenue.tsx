"use client";

import { LineChart } from "@dethink/components";

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
const revenue = [
  42_100, 44_800, 43_900, 48_200, 51_600, 55_300, 54_100, 58_900, 62_400,
  61_800, 66_200, 71_500,
];
const expenses = [
  31_200, 32_100, 34_800, 33_900, 35_600, 37_200, 38_900, 38_100, 40_300,
  42_600, 41_900, 44_100,
];
const payroll = [
  18_400, 18_400, 19_100, 19_100, 19_800, 21_200, 21_200, 21_900, 22_600,
  22_600, 23_400, 23_400,
];

const data = months.map((month, i) => ({
  month,
  revenue: revenue[i],
  expenses: expenses[i],
  payroll: payroll[i],
}));

export function LineChartRevenue() {
  return (
    <div className="w-full">
      <h3 id="revenue-heading" className="mb-3 text-sm font-medium">
        Revenue vs spend, 2026
      </h3>
      <LineChart
        aria-labelledby="revenue-heading"
        data={data}
        index="month"
        indexLabel="Month"
        series={[
          { key: "revenue", label: "Revenue" },
          { key: "expenses", label: "Expenses" },
          { key: "payroll", label: "Payroll" },
        ]}
        formatOptions={{ style: "currency", currency: "USD" }}
      />
    </div>
  );
}
