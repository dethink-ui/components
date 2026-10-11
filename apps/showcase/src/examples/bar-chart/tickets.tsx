"use client";

import { BarChart } from "@dethink/components";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const tickets = [142, 168, 155, 171, 139, 64, 58];

const data = days.map((day, i) => ({ day, tickets: tickets[i] }));

export function BarChartTickets() {
  return (
    <div className="w-full">
      <h3 id="tickets-heading" className="mb-3 text-sm font-medium">
        Support tickets opened
      </h3>
      <BarChart
        aria-labelledby="tickets-heading"
        data={data}
        index="day"
        indexLabel="Day"
        height={200}
        series={[{ key: "tickets", label: "Tickets", color: "chart-7" }]}
      />
    </div>
  );
}
