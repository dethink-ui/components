import { describe, expect, it } from "vitest";
import {
  getStarfieldBackgroundGeometry,
  getStarfieldBackgroundMotionConfig,
} from ".";

describe("getStarfieldBackgroundMotionConfig", () => {
  it("drifts the far layer slowest and the near layer fastest", () => {
    const config = getStarfieldBackgroundMotionConfig("normal");
    const [far, mid, near] = config.driftDurations;

    expect(far).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(near);
  });

  it("scales drift durations by speed tier", () => {
    const slow = getStarfieldBackgroundMotionConfig("slow");
    const normal = getStarfieldBackgroundMotionConfig("normal");
    const fast = getStarfieldBackgroundMotionConfig("fast");

    for (let layer = 0; layer < 3; layer += 1) {
      expect(slow.driftDurations[layer]).toBeGreaterThan(
        normal.driftDurations[layer],
      );
      expect(normal.driftDurations[layer]).toBeGreaterThan(
        fast.driftDurations[layer],
      );
    }
  });

  it("increases parallax depth from the far to the near layer", () => {
    const config = getStarfieldBackgroundMotionConfig("normal");

    expect(config.parallaxDepths).toEqual([3, 6, 10]);
    expect(config.animateEnabled).toBe(true);
    expect(config.twinkleTransition).toMatchObject({
      ease: "easeInOut",
      repeat: Infinity,
    });
  });

  it("returns a disabled config under reduced motion", () => {
    const config = getStarfieldBackgroundMotionConfig("normal", true);

    expect(config.animateEnabled).toBe(false);
    expect(config.reducedMotion).toBe(true);
    expect(config.driftDurations).toEqual([0, 0, 0]);
    expect(config.parallaxDepths).toEqual([0, 0, 0]);
    expect(config.twinkleTransition).toEqual({ duration: 0 });
  });
});

describe("getStarfieldBackgroundGeometry", () => {
  it("is deterministic for a fixed seed and density", () => {
    expect(getStarfieldBackgroundGeometry(7, "normal")).toEqual(
      getStarfieldBackgroundGeometry(7, "normal"),
    );
  });

  it("differs across seeds", () => {
    expect(getStarfieldBackgroundGeometry(7, "normal")).not.toEqual(
      getStarfieldBackgroundGeometry(8, "normal"),
    );
  });

  it("returns three layers with density-scaled star counts and growing radii", () => {
    const sparse = getStarfieldBackgroundGeometry(1, "sparse");
    const normal = getStarfieldBackgroundGeometry(1, "normal");
    const dense = getStarfieldBackgroundGeometry(1, "dense");

    for (const layers of [sparse, normal, dense]) {
      expect(layers).toHaveLength(3);
      expect(layers[0].stars.length).toBeGreaterThan(layers[1].stars.length);
      expect(layers[1].stars.length).toBeGreaterThan(layers[2].stars.length);
      expect(layers[0].radius).toBeLessThan(layers[1].radius);
      expect(layers[1].radius).toBeLessThan(layers[2].radius);
    }

    for (let layer = 0; layer < 3; layer += 1) {
      expect(sparse[layer].stars.length).toBeLessThan(
        normal[layer].stars.length,
      );
      expect(normal[layer].stars.length).toBeLessThan(
        dense[layer].stars.length,
      );
    }
  });

  it("caps twinkles per layer and keeps every value in bounds", () => {
    for (const seed of [1, 7, 42, 1337]) {
      for (const layer of getStarfieldBackgroundGeometry(seed, "dense")) {
        expect(layer.twinkles.length).toBeLessThanOrEqual(8);

        for (const star of layer.stars) {
          expect(star.cx).toBeGreaterThanOrEqual(2);
          expect(star.cx).toBeLessThanOrEqual(98);
          expect(star.cy).toBeGreaterThanOrEqual(2);
          expect(star.cy).toBeLessThanOrEqual(98);
        }

        for (const twinkle of layer.twinkles) {
          expect(twinkle.cx).toBeGreaterThanOrEqual(2);
          expect(twinkle.cx).toBeLessThanOrEqual(98);
          expect(twinkle.cy).toBeGreaterThanOrEqual(2);
          expect(twinkle.cy).toBeLessThanOrEqual(98);
          expect(twinkle.delay).toBeGreaterThanOrEqual(0);
          expect(twinkle.delay).toBeLessThanOrEqual(4);
          expect(twinkle.duration).toBeGreaterThanOrEqual(2);
          expect(twinkle.duration).toBeLessThanOrEqual(5);
        }
      }
    }
  });
});
