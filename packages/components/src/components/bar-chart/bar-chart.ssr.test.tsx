// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { BarChart } from ".";

it("renders bars and the data table on the server", () => {
  const html = renderToString(
    <BarChart
      aria-label="Signups"
      data={[
        { month: "Jan", organic: 12_400, paid: 3_100 },
        { month: "Feb", organic: 15_100, paid: 4_000 },
      ]}
      index="month"
      series={[
        { key: "organic", label: "Organic" },
        { key: "paid", label: "Paid" },
      ]}
      stacked
    />,
  );
  expect(html).toContain('preserveAspectRatio="none"');
  expect(html).toContain('data-slot="chart-bar"');
  expect(html).toContain("<table");
  expect(html).toContain("15.1K");
});
