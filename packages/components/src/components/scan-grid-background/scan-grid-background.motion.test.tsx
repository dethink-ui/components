import { describe, expect, it } from "vitest";
import {
  getScanGridBackgroundGeometry,
  getScanGridBackgroundMotionConfig,
} from ".";

describe("getScanGridBackgroundMotionConfig", () => {
  it("orders scan durations slow > normal > fast with infinite linear loops", () => {
    const slow = getScanGridBackgroundMotionConfig("slow");
    const normal = getScanGridBackgroundMotionConfig("normal");
    const fast = getScanGridBackgroundMotionConfig("fast");

    expect(slow.scanDuration).toBeGreaterThan(normal.scanDuration);
    expect(normal.scanDuration).toBeGreaterThan(fast.scanDuration);
    expect(slow.repeatDelay).toBeGreaterThan(fast.repeatDelay);

    for (const config of [slow, normal, fast]) {
      expect(config.animateEnabled).toBe(true);
      expect(config.reducedMotion).toBe(false);
      expect(config.transition).toMatchObject({
        duration: config.scanDuration,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: config.repeatDelay,
      });
    }
  });

  it("returns a disabled config under reduced motion", () => {
    const config = getScanGridBackgroundMotionConfig("normal", true);

    expect(config.animateEnabled).toBe(false);
    expect(config.reducedMotion).toBe(true);
    expect(config.scanDuration).toBe(0);
    expect(config.repeatDelay).toBe(0);
    expect(config.transition).toEqual({ duration: 0 });
  });
});

describe("getScanGridBackgroundGeometry", () => {
  it("is deterministic for a fixed seed", () => {
    expect(getScanGridBackgroundGeometry(7)).toEqual(
      getScanGridBackgroundGeometry(7),
    );
  });

  it("differs across seeds", () => {
    expect(getScanGridBackgroundGeometry(7)).not.toEqual(
      getScanGridBackgroundGeometry(12),
    );
  });

  it("keeps values within bounds", () => {
    for (const seed of [1, 7, 42, 1337]) {
      const geometry = getScanGridBackgroundGeometry(seed);

      expect(geometry.delay).toBeGreaterThanOrEqual(0);
      expect(geometry.delay).toBeLessThanOrEqual(2);
      expect(geometry.staticOffset).toBeGreaterThanOrEqual(20);
      expect(geometry.staticOffset).toBeLessThanOrEqual(45);
    }
  });
});
