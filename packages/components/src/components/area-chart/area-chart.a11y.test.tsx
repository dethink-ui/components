import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import { AreaChart } from ".";

const data = [
  { week: "W1", organic: 120, paid: 40 },
  { week: "W2", organic: 180, paid: 62 },
  { week: "W3", organic: 150, paid: 58 },
];

const series = [
  { key: "organic", label: "Organic" },
  { key: "paid", label: "Paid" },
];

it("has no automated accessibility violations", async () => {
  const { container } = render(
    <div>
      <h2 id="traffic-heading">Traffic</h2>
      <AreaChart
        aria-labelledby="traffic-heading"
        data={data}
        index="week"
        series={series}
        stacked
      />
      <AreaChart
        aria-label="Paid"
        data={data}
        index="week"
        series={[series[1]!]}
        defaultShowTable
      />
      <AreaChart aria-label="Empty" data={[]} index="week" series={series} />
    </div>,
  );
  expect((await axe(container)).violations).toEqual([]);
});
