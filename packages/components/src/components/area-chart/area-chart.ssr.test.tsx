// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { AreaChart } from ".";

it("renders stacked washes and the data table on the server", () => {
  const html = renderToString(
    <AreaChart
      aria-label="Revenue"
      data={[
        { month: "Jan", new: 12_400, expansion: 3_100 },
        { month: "Feb", new: 15_100, expansion: 4_000 },
      ]}
      index="month"
      series={[
        { key: "new", label: "New" },
        { key: "expansion", label: "Expansion" },
      ]}
      stacked
    />,
  );
  expect(html).toContain('preserveAspectRatio="none"');
  expect(html).toContain('data-slot="chart-area"');
  expect(html).toContain("linearGradient");
  expect(html).toContain("<table");
  expect(html).toContain("15.1K");
});
