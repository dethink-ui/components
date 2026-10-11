// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { DeltaBadge } from ".";

it("renders the signed value and announcement on the server", () => {
  const html = renderToString(<DeltaBadge value={-4.2} comparison="vs Q2" />);
  expect(html).toContain("−4.2%");
  expect(html).toContain("Down 4.2% vs Q2");
});
