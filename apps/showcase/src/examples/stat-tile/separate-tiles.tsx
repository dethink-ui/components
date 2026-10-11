"use client";

import { KpiGroup, StatTile } from "@dethink/components";
import { CreditCard, ShoppingBag, Users } from "lucide-react";

export function StatTileSeparate() {
  return (
    <KpiGroup
      aria-label="Store performance today"
      minTileWidth="15rem"
      className="w-full"
    >
      <StatTile
        href="#orders"
        icon={<ShoppingBag />}
        label="Orders"
        value={1_842}
        delta={12.4}
        comparison="vs yesterday"
        trend={[40, 52, 48, 61, 58, 72, 80, 76, 91, 104]}
        trendVariant="bar"
        trendColor="chart-1"
        trendPlacement="end"
      />
      <StatTile
        href="#customers"
        icon={<Users />}
        label="New customers"
        value={318}
        delta={-2.3}
        comparison="vs yesterday"
        trend={[36, 35, 35.5, 34, 33.5, 33, 32, 32.5, 31.5, 31]}
        trendVariant="line"
        trendColor="chart-5"
        trendPlacement="end"
      />
      <StatTile
        href="#payments"
        icon={<CreditCard />}
        label="Payment success"
        value="99.2%"
        delta={{ value: 0.05, neutralThreshold: 0.1 }}
        comparison="vs yesterday"
        caption="Within the 99% target"
        trend={[98.6, 98.8, 98.7, 98.9, 99, 99.1, 99, 99.2]}
        trendVariant="line"
        trendColor="chart-6"
        trendPlacement="end"
      />
    </KpiGroup>
  );
}
