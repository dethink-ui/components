"use client";

import { AreaChart } from "@dethink/components";

const values = [
  1_210,
  1_260,
  1_190,
  1_320,
  1_410,
  1_380,
  null,
  null,
  1_520,
  1_610,
  1_580,
  1_690,
  1_740,
  1_720,
];

const data = values.map((users, i) => ({ day: `Sep ${i + 1}`, users }));

export function AreaChartActiveUsers() {
  return (
    <div className="w-full">
      <h3 id="active-users-heading" className="mb-3 text-sm font-medium">
        Daily active users
      </h3>
      <AreaChart
        aria-labelledby="active-users-heading"
        data={data}
        index="day"
        indexLabel="Day"
        height={200}
        curve="linear"
        series={[{ key: "users", label: "Active users", color: "chart-3" }]}
      />
    </div>
  );
}
