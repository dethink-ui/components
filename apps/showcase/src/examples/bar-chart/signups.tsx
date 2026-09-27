"use client";

import { BarChart } from "@dethink/components";

const data = [
  { month: "Jan", organic: 1_240, paid: 610, referral: 180 },
  { month: "Feb", organic: 1_310, paid: 680, referral: 210 },
  { month: "Mar", organic: 1_480, paid: 720, referral: 260 },
  { month: "Apr", organic: 1_390, paid: 910, referral: 240 },
  { month: "May", organic: 1_620, paid: 880, referral: 310 },
  { month: "Jun", organic: 1_750, paid: 940, referral: 330 },
];

export function BarChartSignups() {
  return (
    <div className="w-full">
      <h3 id="signups-heading" className="mb-3 text-sm font-medium">
        Signups by channel, H1 2026
      </h3>
      <BarChart
        aria-labelledby="signups-heading"
        data={data}
        index="month"
        indexLabel="Month"
        series={[
          { key: "organic", label: "Organic" },
          { key: "paid", label: "Paid" },
          { key: "referral", label: "Referral" },
        ]}
      />
    </div>
  );
}
