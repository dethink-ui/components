"use client";

import { useState } from "react";
import { LineChart } from "@dethink/components";

const data = [
  { week: "W1", free: 1_240, pro: 310, team: 64 },
  { week: "W2", free: 1_380, pro: 342, team: 71 },
  { week: "W3", free: 1_310, pro: 365, team: 83 },
  { week: "W4", free: 1_520, pro: 398, team: 90 },
  { week: "W5", free: 1_610, pro: 421, team: 102 },
  { week: "W6", free: 1_590, pro: 447, team: 118 },
];

export function LineChartTableView() {
  const [hidden, setHidden] = useState<string[]>(["free"]);
  const [table, setTable] = useState(false);

  return (
    <div className="grid w-full gap-2">
      <LineChart
        aria-label="Weekly signups by plan"
        data={data}
        index="week"
        indexLabel="Week"
        series={[
          { key: "free", label: "Free" },
          { key: "pro", label: "Pro" },
          { key: "team", label: "Team" },
        ]}
        hiddenSeries={hidden}
        onHiddenSeriesChange={setHidden}
        showTable={table}
        onShowTableChange={setTable}
        height={240}
      />
      <p className="text-muted-foreground text-xs">
        Hidden: {hidden.length ? hidden.join(", ") : "none"} · View:{" "}
        {table ? "table" : "chart"}
      </p>
    </div>
  );
}
