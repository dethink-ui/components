import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import { Slider } from ".";
it("has no axe violations for single, range, and disabled sliders", async () => {
  const { container } = render(
    <>
      <Slider label="Volume" defaultValue={40} />
      <Slider<[number, number]>
        label="Budget"
        defaultValue={[20, 80]}
        description="Monthly budget"
      />
      <Slider label="Disabled" disabled />
    </>,
  );
  expect((await axe(container)).violations).toEqual([]);
});
