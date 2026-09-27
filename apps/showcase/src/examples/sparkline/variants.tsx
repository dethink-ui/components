"use client";

import { Sparkline, type SparklineVariant } from "@dethink/components";

const weeklyRevenue = [42, 48, 45, 53, 51, 58, 64, 61, 70, 74, 72, 81];

const variants: Array<{ variant: SparklineVariant; label: string }> = [
  { variant: "line", label: "Line" },
  { variant: "area", label: "Area" },
  { variant: "bar", label: "Bar" },
];

export function SparklineVariants() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-3">
      {variants.map(({ variant, label }) => (
        <figure key={variant} className="grid min-w-0 gap-3">
          <Sparkline
            data={weeklyRevenue}
            variant={variant}
            markers={variant === "bar" ? undefined : ["min", "max", "last"]}
            label={`Weekly revenue, ${label.toLowerCase()} sparkline`}
            formatValue={(value) => `$${value}K`}
            className="h-14"
          />
          <figcaption className="text-muted-foreground text-xs">
            {label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
