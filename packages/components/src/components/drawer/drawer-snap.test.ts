import { describe, expect, it } from "vitest";
import {
  clampSnapPointFraction,
  drawerDragAxis,
  drawerDragClosingSign,
  findNearestDrawerSnapStop,
  resolveDrawerActiveSnapStop,
  resolveDrawerDragReleaseStop,
  resolveDrawerSnapStops,
  shouldDismissDrawerFromVelocity,
} from "./drawer-snap";

describe("clampSnapPointFraction", () => {
  it("clamps to the 0..1 range", () => {
    expect(clampSnapPointFraction(-0.5)).toBe(0);
    expect(clampSnapPointFraction(1.5)).toBe(1);
    expect(clampSnapPointFraction(0.42)).toBe(0.42);
  });

  it("treats non-finite values as 0", () => {
    expect(clampSnapPointFraction(Number.NaN)).toBe(0);
    expect(clampSnapPointFraction(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("drawerDragAxis and drawerDragClosingSign", () => {
  it("maps directions to the correct drag axis", () => {
    expect(drawerDragAxis("top")).toBe("y");
    expect(drawerDragAxis("bottom")).toBe("y");
    expect(drawerDragAxis("left")).toBe("x");
    expect(drawerDragAxis("right")).toBe("x");
  });

  it("maps directions to the correct closing sign", () => {
    expect(drawerDragClosingSign("bottom")).toBe(1);
    expect(drawerDragClosingSign("right")).toBe(1);
    expect(drawerDragClosingSign("top")).toBe(-1);
    expect(drawerDragClosingSign("left")).toBe(-1);
  });
});

describe("resolveDrawerSnapStops", () => {
  it("defaults to [0, 1] when no snap points are configured", () => {
    expect(resolveDrawerSnapStops(undefined)).toEqual([0, 1]);
    expect(resolveDrawerSnapStops([])).toEqual([0, 1]);
  });

  it("dedupes, clamps, and sorts configured snap points, always including 0", () => {
    expect(resolveDrawerSnapStops([0.6, 0.3, 0.6, 1.4, -0.2])).toEqual([
      0, 0.3, 0.6, 1,
    ]);
  });

  it("does not force-include 1 when the largest snap point is below it", () => {
    expect(resolveDrawerSnapStops([0.3, 0.6])).toEqual([0, 0.3, 0.6]);
  });
});

describe("findNearestDrawerSnapStop", () => {
  it("returns the closest stop", () => {
    expect(findNearestDrawerSnapStop(0.55, [0, 0.3, 0.6, 1])).toBe(0.6);
    expect(findNearestDrawerSnapStop(0.1, [0, 0.3, 0.6, 1])).toBe(0);
  });
});

describe("resolveDrawerActiveSnapStop", () => {
  const stops = [0, 0.3, 0.6, 1];

  it("falls back to the largest open stop when nothing is specified", () => {
    expect(resolveDrawerActiveSnapStop({ stops })).toBe(1);
  });

  it("uses defaultSnapPoint when provided, resolving to the nearest stop", () => {
    expect(resolveDrawerActiveSnapStop({ defaultSnapPoint: 0.5, stops })).toBe(
      0.6,
    );
  });

  it("prefers activeSnapPoint over defaultSnapPoint", () => {
    expect(
      resolveDrawerActiveSnapStop({
        activeSnapPoint: 0.3,
        defaultSnapPoint: 1,
        stops,
      }),
    ).toBe(0.3);
  });

  it("never resolves to the closed (0) stop", () => {
    expect(resolveDrawerActiveSnapStop({ activeSnapPoint: 0.01, stops })).toBe(
      0.3,
    );
  });
});

describe("shouldDismissDrawerFromVelocity", () => {
  it("dismisses when velocity meets or exceeds the threshold", () => {
    expect(
      shouldDismissDrawerFromVelocity({
        velocity: 500,
        velocityThreshold: 500,
      }),
    ).toBe(true);
    expect(
      shouldDismissDrawerFromVelocity({
        velocity: 800,
        velocityThreshold: 500,
      }),
    ).toBe(true);
  });

  it("does not dismiss below the threshold or moving the wrong way", () => {
    expect(
      shouldDismissDrawerFromVelocity({
        velocity: 200,
        velocityThreshold: 500,
      }),
    ).toBe(false);
    expect(
      shouldDismissDrawerFromVelocity({
        velocity: -900,
        velocityThreshold: 500,
      }),
    ).toBe(false);
  });
});

describe("resolveDrawerDragReleaseStop", () => {
  const stops = [0, 0.3, 0.6, 1];

  it("snaps back to the start when the drag does not cross closeThreshold", () => {
    expect(
      resolveDrawerDragReleaseStop({
        closeThreshold: 0.25,
        draggedOpenFraction: 0.9,
        startOpenFraction: 1,
        stops,
      }),
    ).toBe(1);
  });

  it("moves to the next lower stop once the drag crosses closeThreshold while closing", () => {
    expect(
      resolveDrawerDragReleaseStop({
        closeThreshold: 0.25,
        draggedOpenFraction: 0.7,
        startOpenFraction: 1,
        stops,
      }),
    ).toBe(0.6);
  });

  it("moves to the next higher stop once the drag crosses closeThreshold while opening", () => {
    expect(
      resolveDrawerDragReleaseStop({
        closeThreshold: 0.25,
        draggedOpenFraction: 0.65,
        startOpenFraction: 0.3,
        stops,
      }),
    ).toBe(0.6);
  });

  it("resolves to 0 (dismiss) when dragged past the lowest stop", () => {
    expect(
      resolveDrawerDragReleaseStop({
        closeThreshold: 0.25,
        draggedOpenFraction: 0.02,
        startOpenFraction: 0.3,
        stops,
      }),
    ).toBe(0);
  });

  it("clamps at the highest stop when opening past it", () => {
    expect(
      resolveDrawerDragReleaseStop({
        closeThreshold: 0.25,
        draggedOpenFraction: 1,
        startOpenFraction: 0.6,
        stops,
      }),
    ).toBe(1);
  });

  it("returns the start stop unchanged when the dragged fraction matches it exactly", () => {
    expect(
      resolveDrawerDragReleaseStop({
        closeThreshold: 0.25,
        draggedOpenFraction: 0.6,
        startOpenFraction: 0.6,
        stops,
      }),
    ).toBe(0.6);
  });

  it("falls back to nearest-stop resolution when the start stop is not in the stops list", () => {
    expect(
      resolveDrawerDragReleaseStop({
        closeThreshold: 0.25,
        draggedOpenFraction: 0.05,
        startOpenFraction: 0.42,
        stops,
      }),
    ).toBe(0);
  });

  it("respects a smaller closeThreshold for quicker stop transitions", () => {
    expect(
      resolveDrawerDragReleaseStop({
        closeThreshold: 0.05,
        draggedOpenFraction: 0.9,
        startOpenFraction: 1,
        stops,
      }),
    ).toBe(0.6);
  });
});
