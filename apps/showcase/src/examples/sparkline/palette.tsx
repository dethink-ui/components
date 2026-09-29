"use client";

import { Sparkline, type ChartTokenColor } from "@dethink/components";

const slots: Array<{ token: ChartTokenColor; hue: string }> = [
  { token: "chart-1", hue: "Blue" },
  { token: "chart-2", hue: "Orange" },
  { token: "chart-3", hue: "Aqua" },
  { token: "chart-4", hue: "Yellow" },
  { token: "chart-5", hue: "Magenta" },
  { token: "chart-6", hue: "Green" },
  { token: "chart-7", hue: "Violet" },
  { token: "chart-8", hue: "Red" },
];

// Deterministic, gently varied series so each slot reads as its own line.
function series(seed: number) {
  return Array.from({ length: 16 }, (_, i) =>
    Math.round(50 + 18 * Math.sin((i + seed * 1.7) / 2.4) + i * (seed % 3)),
  );
}

export function SparklinePalette() {
  return (
    <ul className="grid w-full gap-x-6 gap-y-5 sm:grid-cols-2">
      {slots.map(({ token, hue }, index) => (
        <li
          key={token}
          className="grid min-w-0 grid-cols-[7rem_1fr] items-center gap-4"
        >
          <span className="grid gap-0.5">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ background: `var(--dt-color-${token})` }}
              />
              {hue}
            </span>
            <code className="text-muted-foreground font-mono text-xs">
              {token}
            </code>
          </span>
          <Sparkline
            data={series(index + 1)}
            variant="area"
            color={token}
            label={`${hue} series sample`}
            className="h-10"
          />
        </li>
      ))}
    </ul>
  );
}
