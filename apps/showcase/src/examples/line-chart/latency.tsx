"use client";

import { LineChart } from "@dethink/components";

// Gaps (null) stay gaps: the collector was down for two readings.
const p95 = [
  182,
  176,
  190,
  204,
  null,
  null,
  231,
  218,
  197,
  188,
  179,
  184,
  176,
  171,
];

const data = p95.map((value, i) => ({
  time: `${String(9 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
  p95: value,
}));

export function LineChartLatency() {
  return (
    <div className="w-full">
      <h3 id="latency-heading" className="mb-3 text-sm font-medium">
        API p95 latency (ms)
      </h3>
      <LineChart
        aria-labelledby="latency-heading"
        data={data}
        index="time"
        indexLabel="Time"
        series={[{ key: "p95", label: "p95", color: "chart-7" }]}
        includeZero={false}
        curve="linear"
        height={220}
        formatValue={(value) => `${Math.round(value)} ms`}
      />
    </div>
  );
}
