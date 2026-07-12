import { describe, expect, it } from "vitest";
import {
  getMagneticBeamsBackgroundFollowDuration,
  getMagneticBeamsBackgroundGeometry,
  getMagneticBeamsBackgroundMotionConfig,
  getMagneticBeamsBackgroundPointerProgress,
} from ".";

describe("getMagneticBeamsBackgroundMotionConfig", () => {
  it("orders beam durations slow > normal > fast with infinite linear loops", () => {
    const slow = getMagneticBeamsBackgroundMotionConfig("slow");
    const normal = getMagneticBeamsBackgroundMotionConfig("normal");
    const fast = getMagneticBeamsBackgroundMotionConfig("fast");

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

  it("attracts with a spring transition for every speed", () => {
    for (const speed of ["slow", "normal", "fast"] as const) {
      const config = getMagneticBeamsBackgroundMotionConfig(speed);

      expect(config.attractTransition).toMatchObject({ type: "spring" });
    }
  });

  it("returns a disabled config under reduced motion", () => {
    const config = getMagneticBeamsBackgroundMotionConfig("normal", true);

    expect(config.animateEnabled).toBe(false);
    expect(config.reducedMotion).toBe(true);
    expect(config.beamDuration).toBe(0);
    expect(config.transition).toEqual({ duration: 0 });
    expect(config.attractTransition).toEqual({ duration: 0 });
  });
});

describe("getMagneticBeamsBackgroundGeometry", () => {
  it("is deterministic for a fixed seed and density", () => {
    expect(getMagneticBeamsBackgroundGeometry(7, "normal")).toEqual(
      getMagneticBeamsBackgroundGeometry(7, "normal"),
    );
  });

  it("differs across seeds", () => {
    expect(getMagneticBeamsBackgroundGeometry(7, "normal")).not.toEqual(
      getMagneticBeamsBackgroundGeometry(8, "normal"),
    );
  });

  it("respects density beam counts", () => {
    expect(getMagneticBeamsBackgroundGeometry(1, "sparse")).toHaveLength(3);
    expect(getMagneticBeamsBackgroundGeometry(1, "normal")).toHaveLength(5);
    expect(getMagneticBeamsBackgroundGeometry(1, "dense")).toHaveLength(7);
  });

  it("keeps every beam within bounds", () => {
    for (const seed of [1, 7, 42, 1337]) {
      for (const beam of getMagneticBeamsBackgroundGeometry(seed, "dense")) {
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

describe("getMagneticBeamsBackgroundPointerProgress", () => {
  // A beam is 30% of its rail and travels from -100% to 433% of its own
  // length across one pass; the mapping must place the beam's center on the
  // pointer. Recover the center from the returned progress to verify.
  function beamCenterFraction(progress: number): number {
    const translate = -100 + progress * 533;
    return 0.3 * (translate / 100) + 0.15;
  }

  it("aligns the beam center with the pointer fraction", () => {
    for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
      const progress = getMagneticBeamsBackgroundPointerProgress(fraction);

      expect(beamCenterFraction(progress)).toBeCloseTo(fraction, 5);
    }
  });

  it("increases monotonically with the pointer fraction", () => {
    let previous = getMagneticBeamsBackgroundPointerProgress(0);

    for (const fraction of [0.2, 0.4, 0.6, 0.8, 1]) {
      const progress = getMagneticBeamsBackgroundPointerProgress(fraction);

      expect(progress).toBeGreaterThan(previous);
      previous = progress;
    }
  });

  it("stays within the pass range and clamps out-of-bounds pointers", () => {
    for (const fraction of [-2, -0.01, 0, 0.5, 1, 1.01, 3]) {
      const progress = getMagneticBeamsBackgroundPointerProgress(fraction);

      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }

    expect(getMagneticBeamsBackgroundPointerProgress(-2)).toBe(
      getMagneticBeamsBackgroundPointerProgress(0),
    );
    expect(getMagneticBeamsBackgroundPointerProgress(3)).toBe(
      getMagneticBeamsBackgroundPointerProgress(1),
    );
  });
});

describe("getMagneticBeamsBackgroundFollowDuration", () => {
  it("covers the distance at the beam's normal pass speed", () => {
    // Half a pass at a 6s pass duration takes 3s, regardless of direction.
    expect(getMagneticBeamsBackgroundFollowDuration(0, 0.5, 6)).toBeCloseTo(3);
    expect(getMagneticBeamsBackgroundFollowDuration(0.5, 0, 6)).toBeCloseTo(3);
  });

  it("returns zero when the beam is already on target", () => {
    expect(getMagneticBeamsBackgroundFollowDuration(0.4, 0.4, 6)).toBe(0);
  });

  it("scales with the pass duration", () => {
    expect(
      getMagneticBeamsBackgroundFollowDuration(0.2, 0.7, 9),
    ).toBeGreaterThan(getMagneticBeamsBackgroundFollowDuration(0.2, 0.7, 3.5));
  });
});
