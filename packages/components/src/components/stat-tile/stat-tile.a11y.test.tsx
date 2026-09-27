import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import { KpiGroup, StatTile } from ".";

it("has no automated accessibility violations across tile states", async () => {
  const { container } = render(
    <KpiGroup aria-label="Key metrics">
      <StatTile
        label="Revenue"
        value={48_210}
        delta={8.2}
        comparison="vs last month"
        trend={[3, 5, 4, 7, 8]}
      />
      <StatTile
        label="Churn"
        value="2.1%"
        delta={{ value: -0.3, positiveDirection: "down" }}
      />
      <StatTile
        label="Orders"
        value={120}
        href="/orders"
        trend={[1, 2, 3]}
        trendPlacement="end"
      />
      <StatTile label="Loading" value={0} delta={1} trend={[1, 2]} loading />
    </KpiGroup>,
  );
  expect((await axe(container)).violations).toEqual([]);
});
