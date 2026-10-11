"use client";

import { useState } from "react";
import { Button, KpiGroup, StatTile } from "@dethink/components";

export function StatTileStates() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="grid w-full gap-4">
      <KpiGroup aria-label="Tile states" className="w-full">
        <StatTile
          label="Net revenue"
          value={48_210}
          formatOptions={{ style: "currency", currency: "USD" }}
          delta={5.6}
          comparison="vs last week"
          trend={[31, 35, 34, 39, 41, 44, 48]}
          loading={loading}
          size="sm"
        />
        <StatTile
          label="Refund rate"
          value={null}
          delta={null}
          comparison="vs last week"
          caption="Data resumes after tonight's sync"
          size="sm"
        />
        <StatTile
          label="Annual contract value"
          value={2_400_000}
          formatOptions={{ style: "currency", currency: "USD" }}
          delta={18}
          comparison="year over year"
          size="lg"
        />
      </KpiGroup>
      <div>
        <Button
          size="sm"
          variant="outline"
          aria-pressed={loading}
          onClick={() => setLoading((v) => !v)}
        >
          {loading ? "Finish loading" : "Show loading"}
        </Button>
      </div>
    </div>
  );
}
