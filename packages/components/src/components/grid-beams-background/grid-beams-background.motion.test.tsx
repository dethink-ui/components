import { describe, expect, it } from "vitest";
import {
  getGridBeamsBackgroundGeometry,
  getGridBeamsBackgroundMotionConfig,
} from ".";

describe("getGridBeamsBackgroundMotionConfig", () => {
  it("orders beam durations slow > normal > fast with infinite linear loops", () => {
    const slow = getGridBeamsBackgroundMotionConfig("slow");
    const normal = getGridBeamsBackgroundMotionConfig("normal");
    const fast = getGridBeamsBackgroundMotionConfig("fast");

    expect(slow.beamDuration).toBeGreaterThan(normal.beamDuration);
    expect(normal.beamDuration).toBeGreaterThan(fast.beamDuration);

    for (const config of [slow, normal, fast]) {
      expect(config.animateEnabled).toBe(true);
      expect(config.reducedMotion).toBe(false);
      expect(config.transition).toMatchObject({
        duration: config.beamDuration,
        ease: "linear",
        repeat: Infinity,
      });
    }
  });

  it("returns a disabled config under reduced motion", () => {
    const config = getGridBeamsBackgroundMotionConfig("normal", true);

    expect(config.animateEnabled).toBe(false);
    expect(config.reducedMotion).toBe(true);
    expect(config.beamDuration).toBe(0);
    expect(config.transition).toEqual({ duration: 0 });
  });
});

describe("getGridBeamsBackgroundGeometry", () => {
  it("is deterministic for a fixed seed and density", () => {
    expect(getGridBeamsBackgroundGeometry(7, "normal")).toEqual(
      getGridBeamsBackgroundGeometry(7, "normal"),
    );
  });

  it("differs across seeds", () => {
    expect(getGridBeamsBackgroundGeometry(7, "normal")).not.toEqual(
      getGridBeamsBackgroundGeometry(8, "normal"),
    );
  });

  it("respects density beam counts", () => {
    expect(getGridBeamsBackgroundGeometry(1, "sparse")).toHaveLength(3);
    expect(getGridBeamsBackgroundGeometry(1, "normal")).toHaveLength(5);
    expect(getGridBeamsBackgroundGeometry(1, "dense")).toHaveLength(7);
  });

  it("keeps every beam within bounds", () => {
    for (const seed of [1, 7, 42, 1337]) {
      for (const beam of getGridBeamsBackgroundGeometry(seed, "dense")) {
        expect(["x", "y"]).toContain(beam.axis);
        expect(beam.position).toBeGreaterThanOrEqual(8);
        expect(beam.position).toBeLessThanOrEqual(92);
        expect(beam.delay).toBeGreaterThanOrEqual(0);
        expect(beam.delay).toBeLessThanOrEqual(4);
        expect(beam.repeatDelay).toBeGreaterThanOrEqual(1.5);
        expect(beam.repeatDelay).toBeLessThanOrEqual(5);
        expect(beam.staticOffset).toBeGreaterThanOrEqual(10);
        expect(beam.staticOffset).toBeLessThanOrEqual(60);
      }
    }
  });
});
