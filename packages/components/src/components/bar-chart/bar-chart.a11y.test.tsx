import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import { BarChart } from ".";

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
      <h2 id="signups-heading">Signups</h2>
      <BarChart
        aria-labelledby="signups-heading"
        data={data}
        index="week"
        series={series}
      />
      <BarChart
        aria-label="Stacked"
        data={data}
        index="week"
        series={series}
        stacked
        defaultShowTable
      />
      <BarChart aria-label="Empty" data={[]} index="week" series={series} />
    </div>,
  );
  expect((await axe(container)).violations).toEqual([]);
});
