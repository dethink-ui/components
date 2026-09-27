import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import { Sparkline } from ".";

it("has no automated accessibility violations across variants", async () => {
  const { container } = render(
    <div>
      <Sparkline data={[4, 8, 6, 12]} label="Signups" />
      <Sparkline data={[4, 8, 6, 12]} variant="area" label="Revenue" />
      <Sparkline data={[4, 8, 6, 12]} variant="bar" label="Orders" />
      <Sparkline data={[]} label="Empty" />
      <Sparkline data={[1, 2]} decorative />
    </div>,
  );
  expect((await axe(container)).violations).toEqual([]);
});
