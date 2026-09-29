// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { KpiGroup, StatTile } from ".";

it("renders tiles, deltas and trends without browser APIs", () => {
  const html = renderToString(
    <KpiGroup variant="joined">
      <StatTile label="MRR" value={128_400} delta={4.1} trend={[1, 2, 3]} />
    </KpiGroup>,
  );
  expect(html).toContain("128.4K");
  expect(html).toContain("Up 4.1%");
  expect(html).toContain('data-slot="sparkline"');
  expect(html).toContain('data-variant="joined"');
});
