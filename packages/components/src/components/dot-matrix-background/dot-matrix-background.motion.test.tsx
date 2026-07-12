import { describe, expect, it } from "vitest";
import {
  getDotMatrixBackgroundGeometry,
  getDotMatrixBackgroundMotionConfig,
} from ".";

describe("getDotMatrixBackgroundMotionConfig", () => {
  it("orders pulse durations slow > normal > fast with infinite eased loops", () => {
    const slow = getDotMatrixBackgroundMotionConfig("slow");
    const normal = getDotMatrixBackgroundMotionConfig("normal");
    const fast = getDotMatrixBackgroundMotionConfig("fast");

    expect(slow.pulseDuration).toBeGreaterThan(normal.pulseDuration);
    expect(normal.pulseDuration).toBeGreaterThan(fast.pulseDuration);

    for (const config of [slow, normal, fast]) {
      expect(config.animateEnabled).toBe(true);
      expect(config.reducedMotion).toBe(false);
      expect(config.transition).toMatchObject({
        duration: config.pulseDuration,
        ease: "easeInOut",
        repeat: Infinity,
      });
    }
  });

  it("returns a disabled config under reduced motion", () => {
    const config = getDotMatrixBackgroundMotionConfig("normal", true);

    expect(config.animateEnabled).toBe(false);
    expect(config.reducedMotion).toBe(true);
    expect(config.pulseDuration).toBe(0);
    expect(config.transition).toEqual({ duration: 0 });
  });
});

describe("getDotMatrixBackgroundGeometry", () => {
  it("is deterministic for a fixed seed", () => {
    expect(getDotMatrixBackgroundGeometry(7)).toEqual(
      getDotMatrixBackgroundGeometry(7),
    );
  });

  it("differs across seeds", () => {
    expect(getDotMatrixBackgroundGeometry(7)).not.toEqual(
      getDotMatrixBackgroundGeometry(8),
    );
  });

  it("returns exactly three pulses", () => {
    expect(getDotMatrixBackgroundGeometry(1)).toHaveLength(3);
  });

  it("keeps every pulse within bounds", () => {
    for (const seed of [1, 7, 42, 1337]) {
      for (const pulse of getDotMatrixBackgroundGeometry(seed)) {
        expect(pulse.originX).toBeGreaterThanOrEqual(15);
        expect(pulse.originX).toBeLessThanOrEqual(85);
        expect(pulse.originY).toBeGreaterThanOrEqual(15);
        expect(pulse.originY).toBeLessThanOrEqual(85);
        expect(pulse.delay).toBeGreaterThanOrEqual(0);
        expect(pulse.delay).toBeLessThanOrEqual(3);
        expect(pulse.repeatDelay).toBeGreaterThanOrEqual(0.5);
        expect(pulse.repeatDelay).toBeLessThanOrEqual(2.5);
      }
    }
  });
});
