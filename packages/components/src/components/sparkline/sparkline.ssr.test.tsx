// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { Sparkline } from ".";

it("renders a scalable path and summary without browser APIs", () => {
  const html = renderToString(
    <Sparkline data={[1, 3, 2, 5]} variant="area" label="Latency" />,
  );
  expect(html).toContain("Latency: 4 values, from 1 to 5; low 1, high 5");
  expect(html).toContain('preserveAspectRatio="none"');
  expect(html).toContain('data-slot="sparkline-line"');
});
