import { describe, it, expect } from "vitest";
import {
  sliderStepIndex,
  validateSliderSteps,
  validateSliderValue,
  sliderFormatOptions,
} from "./slider-values";
const steps = [
  { value: 0, label: "Still" },
  { value: 1, label: "Steady" },
  { value: 4, label: "Rapid" },
];
describe("slider values", () => {
  it("infers scientific-notation and minimum-offset precision without overriding explicit digits", () => {
    expect(
      new Intl.NumberFormat("en-US", sliderFormatOptions(1e-7, 0)).format(2e-7),
    ).toBe("0.0000002");
    expect(
      new Intl.NumberFormat("en-US", sliderFormatOptions(1, 0.00001)).format(
        1.00001,
      ),
    ).toBe("1.00001");
    expect(
      new Intl.NumberFormat(
        "en-US",
        sliderFormatOptions(1e-7, 0, { minimumFractionDigits: 5 }),
      ).format(0),
    ).toBe("0.00000");
    expect(
      new Intl.NumberFormat(
        "en-US",
        sliderFormatOptions(1e-7, 0, { maximumSignificantDigits: 2 }),
      ).format(0.1234),
    ).toBe("0.12");
  });
  it("maps uneven values to stops with lower-stop ties and bounded ends", () => {
    expect(
      [-2, 0.5, 1, 2.5, 3, 9].map((value) => sliderStepIndex(value, steps)),
    ).toEqual([0, 0, 1, 1, 2, 2]);
  });
  it("rejects malformed configurations", () => {
    for (const values of [
      [],
      [steps[0]],
      [steps[1], steps[0]],
      [steps[0], steps[0]],
      [steps[0], { value: Infinity, label: "Infinite" }],
      [steps[0], { value: 1, label: " " }],
    ])
      expect(() => validateSliderSteps(values)).toThrow(/Slider steps/);
    expect(() => validateSliderValue([2, 1])).toThrow(/ordered/);
    expect(() => validateSliderValue(NaN)).toThrow(/finite/);
  });
});
