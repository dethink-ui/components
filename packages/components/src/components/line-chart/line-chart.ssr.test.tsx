// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { LineChart } from ".";

it("renders a scaled plot and the data table on the server", () => {
  const html = renderToString(
    <LineChart
      aria-label="Revenue"
      data={[
        { month: "Jan", revenue: 12_400 },
        { month: "Feb", revenue: 15_100 },
      ]}
      index="month"
      series={[{ key: "revenue", label: "Revenue" }]}
    />,
  );
  expect(html).toContain('preserveAspectRatio="none"');
  expect(html).toContain('data-slot="chart-line"');
  expect(html).toContain("<table");
  expect(html).toContain("15.1K");
});
