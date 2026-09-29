"use client";

import { AreaChart } from "@dethink/components";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const desktop = [4_820, 5_140, 5_390, 5_210, 4_760, 2_130, 1_980];
const mobile = [2_310, 2_450, 2_620, 2_580, 2_940, 3_710, 3_880];

const data = days.map((day, i) => ({
  day,
  desktop: desktop[i],
  mobile: mobile[i],
}));

export function AreaChartSessions() {
  return (
    <div className="w-full">
      <h3 id="sessions-heading" className="mb-3 text-sm font-medium">
        Sessions by device, this week
      </h3>
      <AreaChart
        aria-labelledby="sessions-heading"
        data={data}
        index="day"
        indexLabel="Day"
        height={240}
        series={[
          { key: "desktop", label: "Desktop" },
          { key: "mobile", label: "Mobile" },
        ]}
      />
    </div>
  );
}
