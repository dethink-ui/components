import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import { DeltaBadge } from ".";

it("has no automated accessibility violations across states", async () => {
  const { container } = render(
    <div>
      <DeltaBadge value={12.4} comparison="vs last month" />
      <DeltaBadge value={-3} positiveDirection="down" variant="outline" />
      <DeltaBadge value={0} variant="plain" />
      <DeltaBadge value={null} />
    </div>,
  );
  expect((await axe(container)).violations).toEqual([]);
});
