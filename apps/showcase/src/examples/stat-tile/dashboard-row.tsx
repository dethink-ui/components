"use client";

import { KpiGroup, StatTile } from "@dethink/components";

export function StatTileDashboardRow() {
  return (
    <KpiGroup
      aria-label="Workspace health, last 30 days"
      variant="joined"
      className="w-full"
    >
      <StatTile
        label="Monthly recurring revenue"
        value={128_430}
        formatOptions={{ style: "currency", currency: "USD" }}
        delta={8.2}
        comparison="vs last month"
        trend={[92, 96, 95, 101, 104, 103, 109, 113, 112, 118, 124, 128]}
        trendColor="chart-1"
      />
      <StatTile
        label="Active workspaces"
        value={12_408}
        delta={3.1}
        comparison="vs last month"
        trend={[
          10.9, 11, 11.2, 11.1, 11.4, 11.6, 11.7, 11.9, 12, 12.1, 12.3, 12.4,
        ]}
        trendColor="chart-3"
      />
      <StatTile
        label="Logo churn"
        value="1.8%"
        delta={{ value: -0.4, positiveDirection: "down" }}
        comparison="vs last month"
        trend={[2.6, 2.5, 2.7, 2.4, 2.3, 2.2, 2.4, 2.1, 2, 2.2, 1.9, 1.8]}
        trendColor="chart-2"
      />
      <StatTile
        label="API p95 latency"
        value={182}
        formatValue={(value) => `${value} ms`}
        delta={{
          value: 6.5,
          positiveDirection: "down",
        }}
        comparison="vs last week"
        trend={[168, 171, 166, 170, 174, 169, 172, 176, 175, 179, 177, 182]}
        trendColor="chart-7"
      />
    </KpiGroup>
  );
}
