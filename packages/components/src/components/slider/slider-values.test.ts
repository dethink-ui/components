import { describe, it, expect } from "vitest";
import {
  sliderStepIndex,
  validateSliderSteps,
  validateSliderValue,
} from "./slider-values";
const steps = [
  { value: 0, label: "Still" },
  { value: 1, label: "Steady" },
  { value: 4, label: "Rapid" },
];
describe("slider values", () => {
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
