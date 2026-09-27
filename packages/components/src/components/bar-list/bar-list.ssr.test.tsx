// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { BarList } from ".";

it("renders ranked rows and the toggle on the server", () => {
  const html = renderToString(
    <BarList
      limit={1}
      data={[
        { label: "Search", value: 3100 },
        { label: "Direct", value: 12_400 },
      ]}
    />,
  );
  expect(html.indexOf("Direct")).toBeLessThan(html.indexOf("Show 1 more"));
  expect(html).not.toContain("Search");
  expect(html).toContain("12.4K");
});
