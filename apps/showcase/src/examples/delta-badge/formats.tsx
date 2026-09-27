"use client";

import { DeltaBadge } from "@dethink/components";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function DeltaBadgeFormats() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DeltaBadge value={4.2} comparison="vs last quarter" />
      <DeltaBadge
        value={18_400}
        formatValue={(magnitude) => currency.format(magnitude)}
        comparison="vs plan"
      />
      <DeltaBadge
        value={-37}
        formatValue={(magnitude) => `${magnitude} ms`}
        positiveDirection="down"
        comparison="vs last deploy"
      />
      <DeltaBadge
        value={3}
        formatValue={(magnitude) => `${magnitude} pts`}
        size="md"
      />
      <DeltaBadge value={null} comparison="vs last month" />
    </div>
  );
}
