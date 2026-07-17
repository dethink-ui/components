import { describe, expect, it } from "vitest";
import {
  clampIndex,
  clampWithRubberBand,
  getDragDirection,
  getSlideStep,
  getSnapTarget,
  pxToIndexDelta,
} from "./carousel-utils";

describe("getSlideStep", () => {
  it("adds width and gap", () => {
    expect(getSlideStep(300, 16)).toBe(316);
  });

  it("falls back to a safe positive step for degenerate measurements", () => {
    expect(getSlideStep(0, 0)).toBe(1);
    expect(getSlideStep(Number.NaN, 10)).toBe(1);
    expect(getSlideStep(-50, 10)).toBe(1);
  });
});

describe("getDragDirection", () => {
  it("is 1 in LTR and -1 in RTL", () => {
    expect(getDragDirection(false)).toBe(1);
    expect(getDragDirection(true)).toBe(-1);
  });
});

describe("pxToIndexDelta", () => {
  it("converts pixels to index units in LTR", () => {
    expect(pxToIndexDelta(316, 316, 1)).toBe(1);
    expect(pxToIndexDelta(158, 316, 1)).toBeCloseTo(0.5);
  });

  it("flips sign in RTL", () => {
    expect(pxToIndexDelta(316, 316, -1)).toBe(-1);
  });
});

describe("clampIndex", () => {
  it("clamps into range and collapses an empty carousel", () => {
    expect(clampIndex(2, 5)).toBe(2);
    expect(clampIndex(-3, 5)).toBe(0);
    expect(clampIndex(9, 5)).toBe(4);
    expect(clampIndex(3, 0)).toBe(0);
  });
});

describe("clampWithRubberBand", () => {
  it("passes values inside the range through untouched", () => {
    expect(clampWithRubberBand(1.4, 0, 3)).toBe(1.4);
  });

  it("resists overshoot past the ends", () => {
    // 1.0 unit past the max at 0.35 resistance -> 0.35 past the max.
    expect(clampWithRubberBand(4, 0, 3, 0.35)).toBeCloseTo(3.35);
    expect(clampWithRubberBand(-2, 0, 3, 0.35)).toBeCloseTo(-0.7);
  });

  it("collapses an inverted range to the min", () => {
    expect(clampWithRubberBand(5, 3, 0)).toBe(3);
  });
});

describe("getSnapTarget", () => {
  it("rounds to the nearest slide with no velocity", () => {
    expect(getSnapTarget({ offset: 1.2, velocity: 0, min: 0, max: 4 })).toBe(1);
    expect(getSnapTarget({ offset: 1.6, velocity: 0, min: 0, max: 4 })).toBe(2);
  });

  it("projects velocity toward the direction of travel", () => {
    expect(
      getSnapTarget({
        offset: 1.2,
        velocity: 6,
        min: 0,
        max: 4,
        projection: 0.18,
      }),
    ).toBe(2);
    expect(
      getSnapTarget({
        offset: 1.8,
        velocity: -6,
        min: 0,
        max: 4,
        projection: 0.18,
      }),
    ).toBe(1);
  });

  it("clamps the projected target into bounds", () => {
    expect(getSnapTarget({ offset: 4, velocity: 40, min: 0, max: 4 })).toBe(4);
    expect(getSnapTarget({ offset: 0, velocity: -40, min: 0, max: 4 })).toBe(0);
  });
});
