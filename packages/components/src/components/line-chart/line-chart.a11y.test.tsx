import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import { LineChart } from ".";

const data = [
  { week: "W1", signups: 120, trials: 40 },
  { week: "W2", signups: 180, trials: 62 },
  { week: "W3", signups: 150, trials: 58 },
];

it("has no automated accessibility violations", async () => {
  const { container } = render(
    <div>
      <h2 id="signups-heading">Signups</h2>
      <LineChart
        aria-labelledby="signups-heading"
        data={data}
        index="week"
        series={[
          { key: "signups", label: "Signups" },
          { key: "trials", label: "Trials" },
        ]}
      />
      <LineChart
        aria-label="Trials"
        data={data}
        index="week"
        series={[{ key: "trials", label: "Trials" }]}
        defaultShowTable
      />
      <LineChart
        aria-label="Empty"
        data={[]}
        index="week"
        series={[{ key: "trials", label: "Trials" }]}
      />
    </div>,
  );
  expect((await axe(container)).violations).toEqual([]);
});
